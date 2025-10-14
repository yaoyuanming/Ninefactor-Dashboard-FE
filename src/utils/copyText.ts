import { Message } from '@arco-design/web-vue';

const copy = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  Message.success('复制成功');
};

export default copy;
