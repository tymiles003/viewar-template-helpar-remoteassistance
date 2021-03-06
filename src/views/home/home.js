import {
  compose,
  withHandlers,
  lifecycle,
  withProps,
  withState,
} from 'recompose';

import viewarApi from 'viewar-api';
import { getUiConfigPath } from '../../utils';
import {
  withDialogControls,
  withSetLoading,
  withRouteParams,
  withCallClient,
  authManager,
  sceneDraw,
  annotationManager,
} from '../../services';

import template from './home.jsx';

export const init = ({
  viewarApi: { coreInterface, cameras, trackers },
  disconnect,
  setLoadingDone,
  annotationManager,
  resetTrackers,
  authManager,
  updateProgress,
  showDialog,
}) => async () => {
  setLoadingDone(false);

  if (
    !trackers.Remote ||
    (coreInterface.platform !== 'Emscripten' &&
      !trackers.Placenote &&
      !trackers.SixDegrees)
  ) {
    showDialog('InvalidTrackerConfiguration', {
      showCancel: false,
      showConfirm: false,
    });
    return;
  }

  disconnect();

  await cameras.arCamera.activate();
  await resetTrackers();
  await authManager.readPersisted();

  await annotationManager.init(updateProgress);
  await sceneDraw.initMaterials();
  setLoadingDone(true);
};

export const resetTrackers = ({ viewarApi }) => async () => {
  for (let tracker of Object.values(viewarApi.trackers)) {
    await tracker.deactivate();
  }
};

export const goToProductSelection = ({ goTo }) => async () => {
  goTo('/product-selection');
};

export const goToUserSelection = ({
  goTo,
  authManager,
  loadingDone,
  setLoginVisible,
  getUiConfigPath,
  setUsername,
  setPassword,
}) => async () => {
  if (loadingDone) {
    if (authManager.user) {
      setUsername(authManager.user.name);
      setPassword(authManager.token);
    } else {
      if (getUiConfigPath('demo')) {
        setUsername('demo');
        setPassword('demo');
      } else {
        setUsername('');
        setPassword('');
      }
    }

    setLoginVisible(true);
  }
};

export const login = ({ username, password, goTo }) => () => {
  goTo('/user-selection', { username, password });
};

export const updateProgress = ({ setProgress, setStatus }) => count => {
  const progress =
    ((count.current + count.currentProgress / 100) / count.total) * 100;
  setProgress(progress);
};

export const callSupport = ({ goTo }) => () => {
  goTo('/calibration-call', {
    backPath: '/',
    topic: 'Unknown',
  });
};

export default compose(
  withCallClient,
  withRouteParams(),
  withDialogControls,
  withSetLoading,
  withState('loginVisible', 'setLoginVisible', false),
  withState('username', 'setUsername', ''),
  withState('password', 'setPassword', ''),
  withState('loadingDone', 'setLoadingDone', false),
  withState('progress', 'setProgress', 0),
  withProps({
    viewarApi,
    getUiConfigPath,
    authManager,
    annotationManager,
  }),
  withHandlers({
    resetTrackers,
    updateProgress,
  }),
  withHandlers({
    init,
    goToUserSelection,
    goToProductSelection,
    callSupport,
    login,
  }),
  lifecycle({
    componentDidMount() {
      this.props.init();
    },
  })
)(template);
