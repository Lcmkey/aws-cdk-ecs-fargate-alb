import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import {
  Vpc,
  NatProvider,
  Instance,
  InstanceType,
  NatInstanceProvider,
  CfnEIP,
  SubnetType,
  InstanceClass,
  InstanceSize,
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
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      // instanceType: new InstanceType("t3.micro"),
      // keyName: 'Ubuntu-KP'
    });

    /**
     * Create Vpc
     */
    const vpc = new Vpc(this, `${prefix}-${stage}-Vpc-Ec2-Nat`, {
      cidr: "10.2.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          subnetType: SubnetType.PUBLIC,
          name: "Ingress",
          cidrMask: 24,
        },
        {
          cidrMask: 24,
          name: "Application",
          subnetType: SubnetType.PRIVATE,
        },
        // {
        //   cidrMask: 28,
        //   name: "Database",
        //   subnetType: SubnetType.ISOLATED,
        // },
      ],
      natGateways: 2,
      natGatewayProvider: natInstance,
    });

    /**
     * Create Eip
     */
    const natIns = vpc.node
      .findChild("IngressSubnet1") // default name "PublicSubnet1"
      .node.findChild("NatInstance") as Instance;
    const natIns2 = vpc.node
      .findChild("IngressSubnet2")
      .node.findChild("NatInstance") as Instance;

    const natIp = new CfnEIP(this, "natip1", {
      instanceId: natIns.instanceId,
    });
    const natIp2 = new CfnEIP(this, "natip2", {
      instanceId: natIns2.instanceId,
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
    new CfnOutput(this, "eip2", {
      value: natIp2.ref,
    });
  }
}

export { VpcEc2NatStack };
