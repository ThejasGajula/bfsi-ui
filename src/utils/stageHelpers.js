const VALID_STAGE_STATUSES = new Set(['pending', 'active', 'complete', 'error']);

const normalizeStatus = (status) => (VALID_STAGE_STATUSES.has(status) ? status : 'pending');

export const createInitialStages = (stageDefinitions) =>
  stageDefinitions.map((stage) => ({
    ...stage,
    status: normalizeStatus(stage.status),
    elapsed: null,
    errorMessage: null,
  }));

export const markActive = (stages, index) =>
  stages.map((stage, stageIndex) => {
    if (stageIndex !== index || stage.status === 'complete' || stage.status === 'error') {
      return stage;
    }

    return {
      ...stage,
      status: 'active',
      errorMessage: null,
    };
  });

export const markComplete = (stages, index, elapsed) =>
  stages.map((stage, stageIndex) => {
    if (stageIndex !== index) {
      return stage;
    }

    return {
      ...stage,
      status: 'complete',
      elapsed: typeof elapsed === 'number' ? elapsed : null,
      errorMessage: null,
    };
  });

export const markError = (stages, index, errorMessage) =>
  stages.map((stage, stageIndex) => {
    if (stageIndex !== index) {
      return stage;
    }

    return {
      ...stage,
      status: 'error',
      errorMessage,
    };
  });
