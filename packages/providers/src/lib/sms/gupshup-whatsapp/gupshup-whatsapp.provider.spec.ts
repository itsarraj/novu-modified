import { SmsProviderIdEnum } from '@novu/shared';
import axios from 'axios';
import { GupshupWhatsappProvider } from './gupshup-whatsapp.provider';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('Gupshup WhatsApp Provider', () => {
  let provider: GupshupWhatsappProvider;
  let axiosPostSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    provider = new GupshupWhatsappProvider({
      apiKey: 'test-api-key',
      from: '15558378566',
      senderName: 'Finkhoz',
    });

    axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      status: 200,
      data: { messageId: 'test-msg-id', status: 'submitted' },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should trigger gupshup whatsapp correctly', async () => {
    const response = await provider.sendMessage({
      to: '+1234567890',
      content: 'Hello world',
      customData: {
        templateId: 'welcome_template',
        templateParams: ['param1', 'param2'],
      },
    });

    expect(axiosPostSpy).toHaveBeenCalled();
    const args = axiosPostSpy.mock.calls[0];
    const url = args[0];
    const data = args[1] as URLSearchParams;
    const headers = (args[2] as any)?.headers;

    expect(url).toEqual('https://api.gupshup.io/wa/api/v1/template/msg');
    expect(headers?.apikey).toEqual('test-api-key');
    expect(data.get('channel')).toEqual('whatsapp');
    expect(data.get('source')).toEqual('15558378566');
    expect(data.get('destination')).toEqual('+1234567890');
    expect(data.get('src.name')).toEqual('Finkhoz');
    
    const templateField = data.get('template');
    expect(templateField).toBeDefined();
    expect(JSON.parse(templateField!)).toEqual({
      id: 'welcome_template',
      params: ['param1', 'param2'],
    });

    expect(response.id).toEqual('test-msg-id');
  });

  test('should handle validation based on id', () => {
    expect(provider.id).toEqual(SmsProviderIdEnum.GupshupWhatsapp);
  });
});
