// app/auth/mqtt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mqtt, { MqttClient } from 'mqtt';


const brokerUrl = 'wss://broker.hivemq.com:8000/mqtt'; // Replace with ow MQTT broker's address
const topic = 'smartmeter/reload';

const client: MqttClient = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT client error:', error);
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');

  return new Promise(async (resolve) => {
    try {
      const { message } = await request.json();

      if (!message) {
        resolve(NextResponse.json({ error: 'Message is required' }, { status: 400 }));
        return;
      }

      client.on('connect', () => {
        client.publish(topic, String(message), (err) => {
          client.end(); // Cleanly disconnect after publishing
          if (err) {
            console.error('Error publishing:', err);
            resolve(NextResponse.json({ error: 'MQTT publish failed' }, { status: 500 }));
          } else {
            console.log(`✅ Published "${message}" to ${topic}`);
            resolve(NextResponse.json({ message: 'Published successfully' }));
          }
        });
      });

      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        resolve(NextResponse.json({ error: 'MQTT connection failed' }, { status: 500 }));
      });
    } catch (error) {
      console.error('Request error:', error);
      resolve(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
    }
  });
}
