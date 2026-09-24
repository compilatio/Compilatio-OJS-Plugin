import { computed, onBeforeUnmount, ref } from 'vue';
import type { CompilatioDocument, DocumentAction } from '../types/document';
import type { CompilatioDocumentsApi } from '../types/documentsApi';

type ActionKind = DocumentAction['kind'] | 'index';
type Translate = (key: string) => string;

export function useDocumentActions(
  initialDocument: CompilatioDocument,
  api: CompilatioDocumentsApi,
  t: Translate,
  onUpdated: (document: CompilatioDocument) => void,
) {
  const data = ref<CompilatioDocument>({ ...initialDocument });
  const pending = ref<ActionKind | ''>('');
  const error = ref(data.value.status.startsWith('error_') ? data.value.statusLabel : '');
  let mounted = true;

  onBeforeUnmount(() => {
    mounted = false;
  });

  const action = computed<DocumentAction | undefined>(() => {
    const actions: Partial<Record<string, DocumentAction>> = {
      sent: {
        kind: 'play',
        icon: 'play-solid',
        label: 'launch',
        url: data.value.analyseUrl ?? '',
      },
      scored: {
        kind: 'report',
        icon: 'magnifying-glass-chart-regular',
        label: 'report',
        url: data.value.reportUrl ?? '',
      },
      error_sending_failed: {
        kind: 'retry',
        icon: 'arrow-rotate-left',
        label: 'retry',
        url: data.value.retryUrl ?? '',
      },
      queue: { kind: 'loading', icon: 'spinner', label: 'queue' },
      analysing: { kind: 'loading', icon: 'spinner', label: 'analysing' },
    };

    return actions[data.value.status];
  });

  function updateDocument(result: Partial<CompilatioDocument>, retry = false): void {
    data.value = { ...data.value, ...result };
    if (retry) {
      api.addActionUrls(data.value);
    }
    if (mounted) {
      onUpdated({ ...data.value });
    }
  }

  async function perform(kind: ActionKind): Promise<void> {
    if (pending.value || 'loading' === kind) {
      return;
    }

    const currentAction = action.value;
    if ('index' !==kind && (!currentAction || currentAction.kind !== kind)) {
      return;
    }

    // Open synchronously so browsers do not treat the report as an unsolicited popup.
    const reportWindow = 'report' === kind ? window.open('', '_blank') : null;
    pending.value = kind;
    error.value = '';

    try {
      if ('index' === kind) {
        if (!data.value.indexingUrl) {
          throw new Error(t('apiError'));
        }
        const result = await api.patch(data.value.indexingUrl, { indexed: !data.value.indexed });
        updateDocument(result);
        return;
      }

      if ('report' === kind && !reportWindow) {
        throw new Error(t('reportBlocked'));
      }
      if (!currentAction || !('url' in currentAction) || !currentAction.url) {
        throw new Error(t('apiError'));
      }

      const result = await api.post(currentAction.url);
      if ('report' === kind) {
        if (!result.url || !reportWindow) {
          throw new Error(t('reportMissing'));
        }
        reportWindow.location.href = result.url;
      } else {
        updateDocument(result, 'retry' === kind);
      }
    } catch (exception: unknown) {
      reportWindow?.close();
      if (mounted) {
        error.value = exception instanceof Error && exception.message
          ? exception.message
          : t('apiError');
      }
    } finally {
      if (mounted) {
        pending.value = '';
      }
    }
  }

  return { data, pending, error, action, perform };
}
