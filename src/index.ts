import { getInput, info, setFailed, setOutput } from '@actions/core';
import { toBoolean } from './helpers';
import { getBundleSizeDiff } from './main';

export const run = async (): Promise<void> => {
  info(`Starting bundle size diff action.`);
  const paths = getInput('paths');
  const filter = getInput('filter');
  const onlyDiff = toBoolean(getInput('onlyDiff') || 'false');
  try {
    if (!paths || paths.length === 0) throw new Error('Missing paths input!');
    const {
      reports,
      summary = '',
      hasDifferences,
    } = await getBundleSizeDiff(paths, onlyDiff, filter);
    setOutput('reports', reports);
    setOutput('summary', summary);
    setOutput('hasDifferences', hasDifferences);
    info(`Reports:\n${JSON.stringify(reports)}`);
    info(`Summary:\n${summary}`);
    info(`Has differences:\n${hasDifferences}`);
    info(`Bundle size action completed.`);
  } catch (error: any) {
    setFailed(error.message || error);
  }
};

run();
