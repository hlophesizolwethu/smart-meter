// utils/mqtt.ts
import mqtt, { MqttClient } from 'mqtt';

interface MqttConfig {
  brokerUrl: string;
  topic: string;
}

class MqttUtility {
  private client: MqttClient;

  constructor(config: MqttConfig) {
    this.client = mqtt.connect(config.brokerUrl);

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.client.subscribe(config.topic);
    });

    this.client.on('message', (topic: string, message: Buffer) => {
      console.log(`Received message: ${message.toString()}`);
    });
  }

  public publishMessage(topic: string, message: string): void {
    this.client.publish(topic, message, (err?: Error) => {
      if (err) {
        console.error('Error publishing message:', err);
      }
    });
  }
}

export default MqttUtility;