Esta aplicación, desarrollada con HTML5 y Bootstrap, actúa como cliente en un sistema de gestión de incidencias, proporcionando una interfaz visual para el seguimiento de los mantenimientos integrales en edificios de oficinas.

La aplicación utiliza la arquitectura REST para la comunicación con el servidor y emplea Tokens para la autenticación, asegurando un acceso seguro a los servicios.

Funciona en conjunto con el proyecto 'gestor_incidencias_backend', que maneja la lógica de negocio y la interacción con la base de datos.


Notas:</BR>
Certificado y clave privada SSL para servidor Apache en Windows creados con Win-Acme.<BR>
Certificado y clave privada SSL para servidor Apache en Raspbian creados con Certbot.<BR>
Certificado y clave privada SSL para el servidor Tomcat de SpringBoot--> Se utilizan los archivos .pem creados para el Servidor Apache y se utiliza openSSL para convertirlos a un archivo .p12(PKCS12):</BR>
openssl pkcs12 -export \
  -in estebanpa.ddns.net-crt.pem \
  -inkey estebanpa.ddns.net-key.pem \
  -out keystore.p12 \
  -name estebanpa \
  -CAfile estebanpa.ddns.net-chain.pem \
  -caname root

La contraseña para proteger el archivo PKCS12 que nos pide en el proceso de conversión, se utilizará en la configuración de SpringBoot.
Se añade el archivo keystore.p12 en el directorio src/main/resources, y se añade en application.properties:<BR>
server.port=8443<BR>
server.ssl.key-store=classpath:keystore.p12<BR>
server.ssl.key-store-password=tu-contraseña<BR>
server.ssl.key-store-type=PKCS12<BR>
server.ssl.key-alias=estebanpa


