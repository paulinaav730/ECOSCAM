/**
 * ============================================================================
 * ECOSCAM — CONTROLADOR ESP32 PARA ECO WORLD (WOKWI SIMULATOR)
 * ============================================================================
 * Hardware en el circuito Wokwi:
 * - Potenciómetro (GPIO 34): Controla el movimiento del personaje EcoGuardián (0..4095)
 * - Botón 1 Verde (GPIO 14): Iniciar misión / Recoger residuo / Clasificar en caneca
 * - Botón 2 Azul  (GPIO 27): Alternar eje de movimiento (Horizontal X / Vertical Y)
 * - LED Verde     (GPIO 26): Se enciende al clasificar correctamente o recuperar ecosistema
 * - LED Rojo      (GPIO 25): Parpadea cuando ocurre un error de clasificación
 */

#include <WiFi.h>
#include <HTTPClient.h>

const char* SSID = "Wokwi-GUEST";
const char* PASSWORD = "";

// URL del servidor desplegado de ECOSCAM en Vercel
const char* SERVER_URL = "https://ecoscameafit.vercel.app/api/wokwi";
const char* ROOM_CODE = "ECOSCAM";

const int PIN_POT = 34;
const int PIN_BTN_PRIMARY = 14;   // Botón 1 (Verde): Acción / Recoger / Clasificar
const int PIN_BTN_SECONDARY = 27; // Botón 2 (Azul): Cambiar eje (Horizontal / Vertical)
const int PIN_LED_GREEN = 26;
const int PIN_LED_RED = 25;

bool axisVertical = false;
bool lastBtnPrimary = HIGH;
bool lastBtnSecondary = HIGH;
unsigned long lastSyncTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_POT, INPUT);
  pinMode(PIN_BTN_PRIMARY, INPUT_PULLUP);
  pinMode(PIN_BTN_SECONDARY, INPUT_PULLUP);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);

  Serial.println("==========================================");
  Serial.println("🌱 ECOSCAM - ECO WORLD ESP32 CONTROLLER");
  Serial.println("==========================================");
  Serial.print("Conectando a WiFi Wokwi-GUEST");

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi conectado! Listo para controlar ECO WORLD.");
  Serial.println("• Gira el potenciómetro para mover al EcoGuardián.");
  Serial.println("• Presiona BOTÓN VERDE (GPIO 14) para recoger/clasificar.");
  Serial.println("• Presiona BOTÓN AZUL  (GPIO 27) para cambiar eje X/Y.");
  digitalWrite(PIN_LED_GREEN, HIGH);
  delay(400);
  digitalWrite(PIN_LED_GREEN, LOW);
}

void loop() {
  int potValue = analogRead(PIN_POT);
  bool currentPrimary = digitalRead(PIN_BTN_PRIMARY);
  bool currentSecondary = digitalRead(PIN_BTN_SECONDARY);

  bool primaryTriggered = (currentPrimary == LOW && lastBtnPrimary == HIGH);
  bool secondaryTriggered = (currentSecondary == LOW && lastBtnSecondary == HIGH);

  if (secondaryTriggered) {
    axisVertical = !axisVertical;
    Serial.print("🔄 Eje cambiado a: ");
    Serial.println(axisVertical ? "VERTICAL (Arriba/Abajo)" : "HORIZONTAL (Izquierda/Derecha)");
  }

  lastBtnPrimary = currentPrimary;
  lastBtnSecondary = currentSecondary;

  if (primaryTriggered || secondaryTriggered || (millis() - lastSyncTime >= 180)) {
    lastSyncTime = millis();

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");

      String payload = "{";
      payload += "\"room\":\"" + String(ROOM_CODE) + "\",";
      payload += "\"potentiometerValue\":" + String(potValue) + ",";
      payload += "\"axisMode\":\"" + String(axisVertical ? "vertical" : "horizontal") + "\",";
      payload += "\"buttonPrimaryPressed\":" + String(primaryTriggered ? "true" : "false") + ",";
      payload += "\"buttonSecondaryPressed\":" + String(secondaryTriggered ? "true" : "false");
      payload += "}";

      int httpResponseCode = http.POST(payload);
      if (httpResponseCode > 0) {
        String response = http.getString();
        if (response.indexOf("\"lastClassificationResult\":\"correct\"") != -1) {
          digitalWrite(PIN_LED_GREEN, HIGH);
          digitalWrite(PIN_LED_RED, LOW);
        } else if (response.indexOf("\"lastClassificationResult\":\"mistake\"") != -1) {
          digitalWrite(PIN_LED_GREEN, LOW);
          digitalWrite(PIN_LED_RED, HIGH);
        }
      }
      http.end();
    }
  }

  delay(25);
}
