import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { InfoPane } from "@patternplate/components";

import * as actions from "../actions";
import * as item from "../selectors/item";
import withToggleStates from "../connectors/with-toggle-states";

function mapProps(state) {
  return {
    active: item.selectActive(state),
    demoDependencies: item.selectDemoDependencies(state),
    demoDependents: item.selectDemoDependents(state),
    dependencies: item.selectDependencies(state),
    dependents: item.selectDependents(state),
    flag: item.selectFlag(state),
    id: state => state.id,
    icon: item.selectIcon(state),
    type: item.selectType(state),
    name: item.selectName(state),
    manifest: item.selectManifest(state),
    tags: item.selectTags(state),
    version: item.selectVersion(state)
  };
}

export default withToggleStates(connect(mapProps)(InfoPane));
