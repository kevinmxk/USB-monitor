# USB Viewer

һ������ Electron + Spring Boot �� USB �豸��ع��ߡ�

## ��������
- ʵʱ��ز�չʾ���������� USB �豸
- ��ʾ�豸���ơ����̡��������ļ�ϵͳ����ϸ��Ϣ
- �豸�����ʷ��¼������ͳ�ơ�ʱ�����з���
- ֧�����ݵ�����JSON/CSV��
- һ��ˢ�¡���������
- ֧�� Windows 7 ������ϵͳ

## Ŀ¼�ṹ
```
my-electron-app/
������ assets/                  # ǰ���������� bootstrap.min.css/js��
������ resources/               # ͼ�ꡢ��� JAR��JDK���������ϴ� JDK/JAR��
������ main.js                  # Electron ������
������ preload.js               # Ԥ���ؽű�
������ renderer.js              # ��Ⱦ����
������ index.html               # ǰ��ҳ��
������ styles.css               # ��ʽ�ļ�
������ package.json             # ��Ŀ����
������ README.md                # ʹ��˵��
������ .gitignore               # Git �����ļ�
```

## ���ٿ�ʼ

### 1. ��¡��Ŀ
```bash
git clone https://github.com/yourname/usbviewer.git
cd usbviewer
```

### 2. ��װ����
```bash
npm install
```

### 3. ׼����� JAR ���� JDK
- **��� JAR ��**���뽫 `USBmonitor-4.jar` ���� `resources/` Ŀ¼�������б����� Spring Boot ��Ŀ����
- **JDK**������ [OpenJDK 17+](https://adoptium.net/temurin/releases/?version=17) ����ѹ�� `resources/jdk` Ŀ¼��Ŀ¼�ṹ����� `bin/java.exe`����

### 4. ������������
```bash
npm start
```

### 5. ���Ӧ��
```bash
npm run dist
```
��������� `dist/` Ŀ¼�£�������װ��ͱ�Я�档

## ���л���Ҫ��
- Windows 7 ����߰汾
- JDK 17 ����߰汾���Ƽ�ʹ����Ӧ��һͬ�ַ��ı�Яʽ JDK��
- ȷ�� 8080 �˿�δ��ռ��

## ��������
- **�����޷�����**
  - ��� JDK �Ƿ���ȷ����
  - �Թ���Ա�������
  - ���ɱ������Ƿ�����
- **�������Ӧ**
  - ��� 8080 �˿��Ƿ�ռ��
  - ��������
  - ������ǽ����
- **ҳ����ʽ��ʧ**
  - ȷ�� `assets/bootstrap.min.css` �� `assets/bootstrap.bundle.min.js` �ļ�����
- **�����쳣**
  - ���������ɨ�衱ˢ��
  - ��������

## ���빱��
��ӭ issue��PR �ͽ��飡

## ��ԴЭ��
MIT License

## ��ϵ��ʽ
���ߣ�Kevin Huang  