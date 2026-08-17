import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Save, RotateCcw, ServerCog } from 'lucide-react';
import { adminApi } from '../../services/api';
import type { LLMConfig, LLMConfigResponse, LLMConfigUpdatePayload } from '../../types';

const numericFieldError = (value: string) => value === '' || Number.isNaN(Number(value));

function toSafeNumber(value: string, fieldName: string): number {
  if (value === '') {
    throw new Error(`${fieldName} 不能为空`);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`${fieldName} 必须是数字`);
  }
  return parsed;
}

export function LLMConfigPanel() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [configData, setConfigData] = useState<LLMConfigResponse | null>(null);
  const [mockLlm, setMockLlm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('');
  const [maxTokens, setMaxTokens] = useState('');

  const fetchConfig = async () => {
    const data = await adminApi.getLLMConfig();
    setConfigData(data);
    setMockLlm(data.config.mock_llm);
    setApiKey('');
    setBaseUrl(data.config.openai_base_url);
    setModel(data.config.openai_model);
    setTemperature(String(data.config.openai_temperature));
    setMaxTokens(String(data.config.openai_max_tokens));
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchConfig();
      } catch (err) {
        setError(t('common.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [t]);

  const applyConfig = async (payload: LLMConfigUpdatePayload) => {
    const next = await adminApi.updateLLMConfig(payload);
    setConfigData(next);
    setMockLlm(next.config.mock_llm);
    setTemperature(String(next.config.openai_temperature));
    setMaxTokens(String(next.config.openai_max_tokens));
    setBaseUrl(next.config.openai_base_url);
    setModel(next.config.openai_model);
    setApiKey('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      const baseUrlValue = baseUrl.trim();
      const modelValue = model.trim();
      const parsedTemperature = toSafeNumber(temperature, t('admin.llmTemperature'));
      const parsedMaxTokens = toSafeNumber(maxTokens, t('admin.llmMaxTokens'));
      if (baseUrlValue === '' || modelValue === '') {
        throw new Error('Base URL 和模型不能为空');
      }
      if (!Number.isInteger(parsedMaxTokens)) {
        throw new Error(`${t('admin.llmMaxTokens')} 必须是整数`);
      }

      const payload: LLMConfigUpdatePayload = {
        mock_llm: mockLlm,
        openai_base_url: baseUrlValue,
        openai_model: modelValue,
        openai_temperature: parsedTemperature,
        openai_max_tokens: Number(parsedMaxTokens),
      };

      if (apiKey.trim()) {
        payload.openai_api_key = apiKey.trim();
      }

      await applyConfig(payload);
      setMessage(t('admin.llmConfigUpdated'));
    } catch (err) {
      const detail = err instanceof Error ? err.message : t('admin.llmConfigUpdateError');
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreField = async (field: keyof LLMConfig) => {
    try {
      setSaving(true);
      setMessage('');
      setError('');
      await applyConfig({ [field]: null } as LLMConfigUpdatePayload);
      setMessage(t('admin.llmConfigRestored'));
    } catch (err) {
      const detail = err instanceof Error ? err.message : t('admin.llmConfigUpdateError');
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const sourceTag = (field: keyof LLMConfig) => {
    if (!configData) {
      return null;
    }

    return configData.sources[field] === 'runtime' ? t('admin.runtime') : t('admin.env');
  };

  if (loading) {
    return (
      <div className="surface-base p-6">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black section-title text-slate-900">{t('admin.llmConfig')}</h2>
          <p className="text-sm text-slate-600">{t('admin.llmConfigDesc')}</p>
        </div>
        <span className="status-neutral">
          <ServerCog className="w-3.5 h-3.5" />
          {t('admin.runtime')}
        </span>
      </header>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-rose-700">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-between gap-3 surface-base p-4">
          <span className="font-semibold text-slate-900">{t('admin.llmMockMode')}</span>
          <input
            type="checkbox"
            checked={mockLlm}
            onChange={(event) => setMockLlm(event.target.checked)}
          />
        </label>

        <div className="surface-base p-4 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-900">{t('admin.llmSource')}</span>
            <span className="text-xs text-slate-500">
              {sourceTag('openai_base_url')}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {configData?.config.openai_api_key ? t('admin.llmKeyHint') : t('admin.llmNoConfig')}
          </p>
        </div>
      </div>

      <div className="surface-base p-4 space-y-4">
        <div className="grid gap-3">
          <label className="block">
            <span className="input-label">
              <span className="flex items-center justify-between">
                <span>{t('admin.llmApiKey')}</span>
                <span className="text-xs text-slate-500">{sourceTag('openai_api_key')}</span>
              </span>
            </span>
            <div className="flex gap-2">
              <input
                type="password"
                className="input-field flex-1"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={t('admin.llmApiKeyPlaceholder')}
              />
              <button
                type="button"
                className="btn-soft px-3"
                onClick={() => handleRestoreField('openai_api_key')}
                disabled={configData?.sources.openai_api_key !== 'runtime'}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.restore')}</span>
              </button>
            </div>
            <p className="input-help">{t('admin.llmApiKeyDesc')}</p>
          </label>

          <label className="block">
            <span className="input-label">
              <span className="flex items-center justify-between">
                <span>{t('admin.llmBaseUrl')}</span>
                <span className="text-xs text-slate-500">{sourceTag('openai_base_url')}</span>
              </span>
            </span>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://api.openai.com/v1"
              />
              <button
                type="button"
                className="btn-soft px-3"
                onClick={() => handleRestoreField('openai_base_url')}
                disabled={configData?.sources.openai_base_url !== 'runtime'}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.restore')}</span>
              </button>
            </div>
          </label>

          <label className="block">
            <span className="input-label">
              <span className="flex items-center justify-between">
                <span>{t('admin.llmModel')}</span>
                <span className="text-xs text-slate-500">{sourceTag('openai_model')}</span>
              </span>
            </span>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder="gpt-4o-mini"
              />
              <button
                type="button"
                className="btn-soft px-3"
                onClick={() => handleRestoreField('openai_model')}
                disabled={configData?.sources.openai_model !== 'runtime'}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.restore')}</span>
              </button>
            </div>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="input-label">
                <span className="flex items-center justify-between">
                  <span>{t('admin.llmTemperature')}</span>
                  <span className="text-xs text-slate-500">
                    {sourceTag('openai_temperature')}
                  </span>
                </span>
              </span>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  value={temperature}
                  onChange={(event) => setTemperature(event.target.value)}
                  placeholder="0.01"
                />
                <button
                  type="button"
                  className="btn-soft px-3"
                  onClick={() => handleRestoreField('openai_temperature')}
                  disabled={configData?.sources.openai_temperature !== 'runtime'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('admin.restore')}</span>
                </button>
              </div>
            </label>

            <label className="block">
              <span className="input-label">
                <span className="flex items-center justify-between">
                  <span>{t('admin.llmMaxTokens')}</span>
                  <span className="text-xs text-slate-500">
                    {sourceTag('openai_max_tokens')}
                  </span>
                </span>
              </span>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  value={maxTokens}
                  onChange={(event) => setMaxTokens(event.target.value)}
                  placeholder="4096"
                />
                <button
                  type="button"
                  className="btn-soft px-3"
                  onClick={() => handleRestoreField('openai_max_tokens')}
                  disabled={configData?.sources.openai_max_tokens !== 'runtime'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('admin.restore')}</span>
                </button>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="surface-base p-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary px-4 py-2 inline-flex items-center gap-2"
          disabled={saving || numericFieldError(temperature) || numericFieldError(maxTokens)}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? t('common.loading') : t('admin.save')}
        </button>

        <button
          type="button"
          className="btn-soft px-4 py-2 inline-flex items-center gap-2"
          onClick={() => handleRestoreField('mock_llm')}
          disabled={saving || !configData || configData.sources.mock_llm !== 'runtime'}
        >
          <RotateCcw className="w-4 h-4" />
          {t('admin.restore')}
        </button>

      </div>
    </section>
  );
}
