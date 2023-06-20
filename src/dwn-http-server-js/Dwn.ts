import {
  Dwn as DwnReference,
  MessageReply,
  MessageStoreLevel,
  DataStoreLevel,
  EventLogLevel,
  ProtocolsConfigure,
  SignatureInput,
  ProtocolDefinition } from '@tbd54566975/dwn-sdk-js';

export class Dwn {
  static storagePrefix = './data';
  static #instance: DwnReference;

  static processMessage = async (tenant: string, rawMessage: any, dataStream?: any): Promise<MessageReply> => {
    if (!Dwn.#instance) {
      this.#instance = await DwnReference.create({
        messageStore: new MessageStoreLevel({
          blockstoreLocation : `${Dwn.storagePrefix}/dwn-message-store`,
          indexLocation      : `${Dwn.storagePrefix}/dwn-message-index`
        }),
        dataStore: new DataStoreLevel({
          blockstoreLocation: `${Dwn.storagePrefix}/dwn-blockstore`
        }),
        eventLog: new EventLogLevel({
          location: `${Dwn.storagePrefix}/dwn-event-log`
        }) });
    }

    return await Dwn.#instance.processMessage(tenant, rawMessage, dataStream);
  };

  static configureProtocol =
    async (tenant: string, definition: ProtocolDefinition, signatureInput: SignatureInput) => {
      const { message } = await ProtocolsConfigure.create({ definition, authorizationSignatureInput: signatureInput });
      const { status } = await Dwn.processMessage(tenant, message);
      if (status.code !== 202) console.error('Failed to configure protocol', definition.protocol, status);
    };
}