/**
 * Test barrel — re-exports pure-logic functions from the src/ modules so that
 * esbuild can bundle them into an ESM file importable by the Node test runner.
 *
 * The `obsidian` import is type-level only (erased at compile time), so the
 * bundled output has no runtime dependency on the Obsidian API.
 */

// formatter
export { formatTaskLine } from '../src/markdown/formatter';

// parser
export { parseTaskLine, sectionToType, isValidDateString } from '../src/markdown/parser';

// tags
export { sanitizeTag, normalizeTagKey, buildTagReverseIndex } from '../src/markdown/tags';

// dataview
export { buildDataviewBlock } from '../src/lib/dataview';

// line-edit
export { spliceLineByIndex, replaceUniqueLine, findLineIndexById } from '../src/vault/line-edit';

// inline-fields
export {
  parseInlineFields,
  extractId,
  extractCompletionDate,
  extractSubId,
  stripInlineFields,
  hasScoredMarker,
  stripScoredMarker,
  buildInlineField,
} from '../src/markdown/inline-fields';

// sync-file-model
export { parseSyncFile } from '../src/sync/sync-file-model';
