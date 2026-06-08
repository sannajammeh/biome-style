// Within-project imports written as absolute / path-aliased specifiers. The
// guide prefers relative imports within a project — but which specifiers count
// as "within project" (`@/`, `~/`, `src/`, …) is a per-project policy, not a
// universal syntactic signal. See the test file for the reclassification.
import { a } from '@/foo';
import { b } from 'src/bar';
