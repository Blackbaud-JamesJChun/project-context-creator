/**
 * DO NOT MODIFY
 * This file is handled by the @blackbaud-internal/skyux-angular-builders
 * library. Custom ESLint configurations should be added to the
 * eslint.config.workspace.mjs file.
 */

import skyuxInternal from '@blackbaud-internal/eslint-config-skyux';

import prettier from 'eslint-config-prettier';
import skyux from 'eslint-config-skyux';
import tseslint from 'typescript-eslint';

import workspace from './eslint.config.workspace.mjs';

export default tseslint.config(...skyux, ...workspace, ...skyuxInternal, prettier);
