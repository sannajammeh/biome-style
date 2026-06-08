// External packages and relative imports are always fine. Crucially, a bare
// specifier is ambiguous: `react` is an external package, but a project could
// resolve a bare `mymodule` internally — syntax alone cannot tell them apart.
import { x } from 'react';
import { y } from '@scope/pkg';
import { z } from './local';
