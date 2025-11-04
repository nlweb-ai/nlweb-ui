/**
 * WidgetRenderer Component
 * Decides whether to render custom widget (iframe) or default widget
 */

import type { WidgetInstance } from '../types/conversation';
import { DefaultListWidget } from '../widgets/DefaultListWidget';

interface WidgetRendererProps {
  widget: WidgetInstance;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const hasCustomWidget =
    widget.widgetUri &&
    widget.widgetUri.startsWith('ui://') &&
    !widget.widgetUri.startsWith('ui://default/');

  if (hasCustomWidget) {
    // Custom widget from app - would use iframe (Phase 3)
    // For now, show placeholder
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600">
          Custom widget: <code className="text-xs bg-gray-200 px-1 py-0.5 rounded">{widget.widgetUri}</code>
        </p>
        <p className="text-xs text-gray-500 mt-2">Custom widget rendering will be implemented in Phase 3</p>
      </div>
    );
  }

  // Use default widget (ChatGPT-style list)
  return <DefaultListWidget data={widget.data} />;
}
