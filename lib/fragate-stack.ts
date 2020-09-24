import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import {
  Cluster,
  FargateTaskDefinition,
  ContainerImage,
  FargateService,
} from "@aws-cdk/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
} from "@aws-cdk/aws-elasticloadbalancingv2";

interface FragateStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

class FragateStack extends Stack {
  public readonly cluster: Cluster;
  public readonly ecsService: FargateService;

  constructor(scope: Construct, id: string, props: FragateStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    /**
     * Cluster Definition
     */
    const cluster = new Cluster(this, `${prefix}-${stage}-Cluster`, {
      clusterName: `${prefix}-${stage}-Cluster`,
    });

    const taskDefinition = new FargateTaskDefinition(
      this,
      `${prefix}-${stage}-Task-Def`,
      //   { cpu: 1, memoryLimitMiB: 128 },
    );

    const container = taskDefinition.addContainer("DefaultContainer", {
      image: ContainerImage.fromAsset("./app"),
      memoryLimitMiB: 512,
      cpu: 256,
    });

    container.addPortMappings({
      containerPort: 3000,
    });

    const ecsService = new FargateService(this, "Service", {
      cluster,
      taskDefinition,
      desiredCount: 2,
    });

    const lb = new ApplicationLoadBalancer(this, "LoadBalancer", {
      loadBalancerName: `${prefix}-${stage}-LoadBalancer`,
      vpc: cluster.vpc,
      internetFacing: true,
    });

    const listener = lb.addListener("Listener", { port: 80 });

    const targetGroup = listener.addTargets("ECS", {
      protocol: ApplicationProtocol.HTTP,
      port: 3000,
      targets: [ecsService],
    });

    /**
     * Assign Certificate Arn to gloabal var
     */
    this.cluster = cluster;
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
    this.createCfnOutput({
      id: `${prefix}-${stage}-LoadBalancer-DNS`,
      value: lb.loadBalancerDnsName,
    });
    this.createCfnOutput({
      id: `${prefix}-${stage}-LoadBalancer-Arn`,
      value: lb.loadBalancerArn,
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

export { FragateStack };
