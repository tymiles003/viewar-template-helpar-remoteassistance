import React from 'react';
import { compose, pure, lifecycle, withState, withProps } from 'recompose';
import { withSetLoading } from '../../../services';

import viewarApi from 'viewar-api';

import { initTracking, activateARCamera } from '../tracking-utils';

export default compose(
  withSetLoading,
  withState('loadingVisible', 'setLoadingVisible', true),
  withProps({
    initTracking,
    activateARCamera,
  }),
  lifecycle({
    async componentWillMount() {
      const {
        setLoading,
        initTracking,
        activateARCamera,
        goToNext,
        tracker,
      } = this.props;

      setLoading(true, { opaque: true });
      await activateARCamera(viewarApi);
      await initTracking(tracker);
      setLoading(false);

      goToNext();
    },
  }),
  pure
)(() => <div />);
