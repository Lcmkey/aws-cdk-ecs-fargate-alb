import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import { Vpc, SubnetType, SecurityGroup, Peer, Port } from "@aws-cdk/aws-ec2";

interface VpcStackProps extends StackProps {
  readonly prefix: string;
  readonly stage: string;
}

interface subnetConfigurationSchema {
  readonly name: string;
  readonly subnetType: SubnetType;
}

class VpcStack extends Stack {
  readonly vpc: Vpc;
  readonly lbSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    /**
     * Get var from props
     */
    const { prefix, stage } = props;

    const subnetConfiguration = [
      {
        cidrMask: 24,
        name: `${prefix}-${stage}-PUBLIC-subnet-`,
        subnetType: SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: `${prefix}-${stage}-PRIVATE-subnet-`,
        subnetType: SubnetType.PRIVATE,
      },
      {
        cidrMask: 24,
        name: `${prefix}-${stage}-ISOLATED-subnet-`,
        subnetType: SubnetType.ISOLATED,
      },
    ];

    // Define Vpc
    const vpc = this.createVpc({
      id: `${prefix}-${stage}`,
      cidr: "10.2.0.0/16",
      maxAzs: 2,
      subnet: subnetConfiguration,
      natGateways: 2,
    });

    /**
     * Security Group
     */
    // const lbSecurityGroup = this.createSecurityGroup({
    //   id: `${prefix}-${stage}-LB-SecurityGroup`,
    //   name: `${prefix}-${stage}-LB-Sg`,
    //   vpc,
    //   allowAllOutbound: false,
    // });

    // lbSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

    /**
     * Cfn Ouput
     */
    this.createCfnOutput({
      id: `${prefix}-${stage}-Vpc-Default-Security-Group`,
      value: vpc.vpcDefaultSecurityGroup,
    });

    this.vpc = vpc;
    // this.lbSecurityGroup = lbSecurityGroup;
  }

  // Create Cloudformation Output
  private createCfnOutput({ id, value }: { id: string; value: string }) {
    new CfnOutput(this, id, { value });
  }

  private createVpc({
    id,
    cidr,
    maxAzs,
    subnet,
    natGateways,
  }: {
    id: string;
    cidr: string;
    maxAzs: number;
    subnet: Array<subnetConfigurationSchema>;
    natGateways: number;
  }): Vpc {
    return new Vpc(this, `${id}-VpcStack`, {
      cidr,
      maxAzs,
      subnetConfiguration: subnet,
      natGateways,
    });
  }

  private createSecurityGroup({
    id,
    name,
    vpc,
    allowAllOutbound,
  }: {
    id: string;
    name: string;
    vpc: Vpc;
    allowAllOutbound: boolean;
  }): SecurityGroup {
    const securityGroup = new SecurityGroup(this, id, {
      vpc,
      securityGroupName: name,
      allowAllOutbound,
    });

    return securityGroup;
  }
}

export { VpcStack };
