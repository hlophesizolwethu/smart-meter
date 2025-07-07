// app/auth/mqtt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mqtt, { MqttClient } from 'mqtt';

const brokerUrl = 'mqtt://localhost:1883'; // Replace with your MQTT broker's address
const topic = 'smart-meter/units';

const client: MqttClient = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

client.on('error', (error) => {
  console.error('MQTT client error:', error);
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestData = await request.json();
    const message = requestData.message;

    if (typeof message === 'undefined' || message === null) {
      return NextResponse.json({ error: 'Message is required in the request body.' }, { status: 400 });
    }

    return new Promise((resolve) => {
      client.publish(topic, String(message), (error?: Error) => {
        if (error) {
          console.error('Error publishing message to MQTT:', error);
          resolve(NextResponse.json({ error: 'Failed to publish message to MQTT.' }, { status: 500 }));
        } else {
          console.log(`Message "${message}" published to topic "${topic}"`);
          resolve(NextResponse.json({ message: 'Message published successfully to MQTT.' }));
        }
      });
    });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}