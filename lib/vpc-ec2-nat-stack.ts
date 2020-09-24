import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import {
  Vpc,
  NatProvider,
  Instance,
  InstanceType,
  NatInstanceProvider,
  CfnEIP,
  SubnetType,
} from "@aws-cdk/aws-ec2";

interface VpcEc2NatStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

class VpcEc2NatStack extends Stack {
  readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: VpcEc2NatStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    const natInstance = NatProvider.instance({
      instanceType: new InstanceType("t3.micro"),
      // keyName: 'Ubuntu-KP'
    });

    /**
     * Create Vpc
     */
    const vpc = new Vpc(this, `${prefix}-${stage}-Vpc-Ec2-Nat`, {
      cidr: "10.2.0.0/16",
      // maxAzs: 2,
      // subnetConfiguration: [
      //   {
      //     subnetType: SubnetType.PUBLIC,
      //     name: "Ingress",
      //     cidrMask: 22,
      //   },
      //   {
      //     cidrMask: 22,
      //     name: "Application",
      //     subnetType: SubnetType.PRIVATE,
      //   },
      //   {
      //     cidrMask: 22,
      //     name: "Database",
      //     subnetType: SubnetType.ISOLATED,
      //   },
      // ],
      natGateways: 2,
      natGatewayProvider: natInstance,
    });

    const natIns = vpc.node
      .findChild("PublicSubnet1")
      .node.findChild("NatInstance") as Instance;

    const natIp = new CfnEIP(this, "natip", {
      instanceId: natIns.instanceId,
    });

    /**
     * Assign service to gloabal var
     */
    this.vpc = vpc;

    /**
     * Cfn Ouput
     */
    new CfnOutput(this, "eip", {
      value: natIp.ref,
    });
  }
}

export { VpcEc2NatStack };
