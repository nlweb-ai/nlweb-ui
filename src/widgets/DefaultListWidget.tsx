/**
 * DefaultListWidget Component
 * ChatGPT-style list widget (based on pizzaz-list pattern)
 * Renders NLWeb content as cards
 */

import { Star, ExternalLink } from 'lucide-react';
import type { ContentItem } from '../types/mcp';

interface DefaultListWidgetProps {
  data: any;
}

export function DefaultListWidget({ data }: DefaultListWidgetProps) {
  // Handle different data formats
  const items: ContentItem[] = Array.isArray(data) ? data : data?.content || [];

  // Extract resources
  const resources = items
    .filter((item) => item.type === 'resource')
    .map((item) => item.resource?.data)
    .filter(Boolean)
    .slice(0, 10); // Show up to 10 items

  // Extract text summary
  const textItems = items.filter((item) => item.type === 'text');

  if (resources.length === 0 && textItems.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Text summary if present */}
      {textItems.length > 0 && (
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {textItems.map((item, i) => (
            <p key={i}>{item.text}</p>
          ))}
        </div>
      )}

      {/* Resource cards */}
      {resources.length > 0 && (
        <div className="space-y-3">
          {resources.map((resource: any, index: number) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {/* Thumbnail if available */}
                {resource.image && (
                  <img
                    src={resource.image}
                    alt={resource.name || 'Resource'}
                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 truncate">
                    {resource.name || resource.title || 'Untitled'}
                  </h3>

                  {/* Description */}
                  {resource.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {resource.site && (
                      <span className="font-medium">{resource.site}</span>
                    )}
                    {resource.recipeCategory && Array.isArray(resource.recipeCategory) && (
                      <span>{resource.recipeCategory[0]}</span>
                    )}
                    {resource.totalTime && <span>{resource.totalTime}</span>}
                    {resource.aggregateRating?.ratingValue && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {resource.aggregateRating.ratingValue}
                      </span>
                    )}
                  </div>
                </div>

                {/* Link to source */}
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
