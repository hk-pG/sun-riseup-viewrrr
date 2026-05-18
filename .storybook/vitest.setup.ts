import { setProjectAnnotations } from '@storybook/react-vite';
import { beforeAll } from 'vitest';
import * as preview from './preview';

const annotations = setProjectAnnotations([preview]);

// Storybook のグローバルセットアップ（beforeAll フック）を実行
beforeAll(annotations.beforeAll);
