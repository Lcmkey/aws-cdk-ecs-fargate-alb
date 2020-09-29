import {
  Construct,
  Stack,
  StackProps,
  CfnOutput,
  Duration,
} from "@aws-cdk/core";
import { Cluster, FargateService } from "@aws-cdk/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
} from "@aws-cdk/aws-elasticloadbalancingv2";
import { Vpc } from "@aws-cdk/aws-ec2";
import { AdjustmentType } from "@aws-cdk/aws-applicationautoscaling";

interface ElbStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
  // readonly cluster: Cluster;
  readonly fargateService: FargateService;
  readonly vpc: Vpc;
  // readonly clusterArn: string;
  // readonly clusterName: string;
}

class ElbStack extends Stack {
  constructor(scope: Construct, id: string, props: ElbStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage, vpc, fargateService } = props;

    // const cluster = Cluster.fromClusterAttributes(this, "Cluster", {
    //   clusterName: clusterName,
    //   clusterArn: clusterArn,
    //   vpc: vpc,
    //   securityGroups: [],
    // });

    /**
     * Create Application Load Balancer
     */
    const lb = new ApplicationLoadBalancer(this, "LoadBalancer", {
      loadBalancerName: `${prefix}-${stage}-LoadBalancer`,
      vpc: vpc,
      internetFacing: true,
    });

    const listener = lb.addListener("Listener", { port: 80, open: true });

    /**
     * Create Target Group
     */
    const targetGroup = listener.addTargets("ECS", {
      targetGroupName: `${prefix}-${stage}-ECS-TG`,
      protocol: ApplicationProtocol.HTTP,
      port: 3000,
      targets: [fargateService],
      deregistrationDelay: Duration.seconds(0),
      // include health check (default is none)
      healthCheck: {
        interval: Duration.seconds(60),
        path: "/",
        timeout: Duration.seconds(5),
      },
    });

    /**
     * Auto Scaling policy
     */
    const scaling = fargateService.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 5,
    });

    // scaling.scaleOnCpuUtilization("Cpu-Scaling", {
    //   targetUtilizationPercent: 50,
    //   scaleInCooldown: Duration.seconds(60),
    //   scaleOutCooldown: Duration.seconds(60),
    // });

    scaling.scaleOnMetric("metric-scaling", {
      // metric: lb.metricTargetResponseTime(),
      metric: fargateService.metricCpuUtilization(),
      scalingSteps: [
        { upper: 5, change: -1 },
        { lower: 10, change: +1 },
        { lower: 20, change: +2 },
        { lower: 30, change: +3 },
        { lower: 50, change: +4 },
      ],
      /**
       * Change this to AdjustmentType.PERCENT_CHANGE_IN_CAPACITY to interpret the
       * 'change' numbers before as percentages instead of capacity counts.
       */
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
    });

    /**
     * Cfn Ouput
     */
    this.createCfnOutput({
      id: `${prefix}-${stage}-LoadBalancer-DNS-Name`,
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

export { ElbStack };
