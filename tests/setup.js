import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

global.React = React;
expect.extend(matchers);
