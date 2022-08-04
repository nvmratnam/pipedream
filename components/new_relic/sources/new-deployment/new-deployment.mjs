import app from "../../new_relic.app.mjs";

export default {
  dedupe: "unique",
  type: "source",
  key: "new-relic_new-deployment",
  name: "New Deployment",
  description: "Emit new event when a new deployment is created.",
  version: "0.0.1",
  props: {
    app,
    db: "$.service.db",
    timer: {
      label: "Polling interval",
      description: "How often to poll the New Relic for new events",
      type: "$.interface.timer",
      default: {
        intervalSeconds: 60 * 15,
      },
    },
    application: {
      propDefinition: [
        app,
        "application",
      ],
    },
  },
  methods: {
    _setLastEmittedDeploy(deployment) {
      this.db.set("lastEmittedDeploy", deployment);
    },
    _getLastEmittedDeploy() {
      return this.db.get("lastEmittedDeploy");
    },
    getMeta({
      id,
      revision,
      timestamp,
    }) {
      return {
        id,
        summary: revision,
        ts: new Date(timestamp),
      };
    },
  },
  async run () {
    const deployments = await this.app.listDeployments(this.application);
    const toEmitEvents = [];
    const prevRequestFirstItem = this._getLastEmittedDeploy();
    for (const deployment of deployments) {
      if (prevRequestFirstItem == deployment.id ) {
        break;
      }2;
      toEmitEvents.unshift(deployment);
    }
    this._setLastEmittedDeploy(deployments[0].id);

    for (const deployment of toEmitEvents) {
      this.$emit(deployment, this.getMeta(deployment));
    }
  },
};
