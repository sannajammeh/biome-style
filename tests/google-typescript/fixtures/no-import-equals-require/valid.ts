// ESM imports and non-require import-equals are allowed.
import x from 'mod';
import { y } from 'other';
import * as ns from 'wildcard';
import alias = ns.Inner;
import nested = ns.Inner.Deep;

export { x, y, alias, nested };
