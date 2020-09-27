import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import {
  Cluster,
  FargateTaskDefinition,
  ContainerImage,
  FargateService,
  Protocol,
  AwsLogDriver,
} from "@aws-cdk/aws-ecs";
import { Vpc, SecurityGroup } from "@aws-cdk/aws-ec2";

interface EcsStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  readonly vpc: Vpc;
  // readonly securityGroup: SecurityGroup;
}

class EcsStack extends Stack {
  public readonly ecsService: FargateService;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage, vpc } = props;

    /**
     * Create Cluster
     */
    const cluster = new Cluster(this, `${prefix}-${stage}-Cluster`, {
      clusterName: `${prefix}-${stage}-Cluster`,
      vpc,
    });

    /**
     * Create CloudWatch Logs
     */
    const logging = new AwsLogDriver({
      streamPrefix: `${prefix}-${stage}-web-log`,
    });

    /**
     * Create Task Definition
     */
    const taskDefinition = new FargateTaskDefinition(
      this,
      `${prefix}-${stage}-Task-Def`,
      //   { cpu: 1, memoryLimitMiB: 128 },
    );

    /**
     * Add Container
     */
    const container = taskDefinition.addContainer("DefaultContainer", {
      image: ContainerImage.fromAsset("./app"),
      memoryLimitMiB: 512,
      cpu: 256,
      logging,
    });

    /**
     * Add Container Port
     */
    container.addPortMappings({
      containerPort: 3000,
      // hostPort: 80,
      protocol: Protocol.TCP,
    });

    /**
     * Create Fragate Services
     */
    const ecsService = new FargateService(this, "Service", {
      serviceName: `${prefix}-${stage}-Service`,
      cluster,
      taskDefinition,
      desiredCount: 2,
    });

    /**
     * Assign service to gloabal var
     */
    this.ecsService = ecsService;

    /**
     * Cfn Ouput
     */
    this.createCfnOutput({
      id: `${prefix}-${stage}-Cluster-Name`,
      value: cluster.clusterName,
    });
    this.createCfnOutput({
      id: `${prefix}-${stage}-Cluster-Arn`,
      value: cluster.clusterArn,
    });
  }

  /**
   * Create Cloudformation Output
   * @param param0
   */
  private createCfnOutput({ id, value }: { id: string; value: string }) {
    new CfnOutput(this, id, { value });
  }
}

export { EcsStack };
