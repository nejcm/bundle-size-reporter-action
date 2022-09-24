import { getInput, info, setFailed, setOutput } from '@actions/core';
import { toBoolean } from './helpers';
import { getBundleSizeDiff } from './main';

export const run = async (): Promise<void> => {
  info(`Starting bundle size diff action.`);
  const paths = getInput('paths');
  const onlyDiff = toBoolean(getInput('onlyDiff') || 'false');
  try {
    if (!paths || paths.length === 0) throw new Error('Missing paths input!');
    const { reports, summary = '' } = await getBundleSizeDiff(paths, onlyDiff);
    setOutput('reports', reports);
    setOutput('summary', summary);
    info(`Bundle size action completed.`);
  } catch (error: any) {
    setFailed(error.message);
    setOutput('summary', '');
  }
};

run();
