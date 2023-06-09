export const resolveEndpoint = async (did: string): Promise<string> => {
  console.log('Resolve DWN endpoint...', did);
  return 'test';
};

export const createMessage = async (data: any): Promise<any> => {
  console.log('Create message...', data);
};

export const sendMessage = async (endpoint: string, message: any): Promise<any> => {
  console.log('Send DWM via fetch...', message);
};