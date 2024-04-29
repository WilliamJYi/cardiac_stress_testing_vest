#include "esp_spiffs.h"
#include <stdio.h>
#include "esp_event.h"
#include "driver/gpio.h"
#include <driver/dac.h>
#include <LiquidCrystal.h>
#include "SPIFFS.h"

#define pin25 25
#define pin36 36

#include <Firebase_ESP_Client.h>

// //Provide the token generation process info.
 #include "addons/TokenHelper.h"
// //Provide the RTDB payload printing info and other helper functions.
 #include "addons/RTDBHelper.h"

// // Insert your network credentials
#define WIFI_SSID ""
#define WIFI_PASSWORD ""

///SCHOOL NETWORK DEFINES
#define EAP_IDENTITY "TMU" //if connecting from another corporation, use identity@organisation.domain in Eduroam 
#define EAP_USERNAME "" //oftentimes just a repeat of the identity j1yi
#define EAP_PASSWORD "" //your Eduroam password
const char* ssid = "TMU"; // Eduroam SSID
const char* host = "arduino.php5.sk"; //external server domain for HTTP connection after authentification
//SCHOOL NETWORK DEFINES ENDS
int counter =0;
void connectToWifiSCHOOL(){
  delay(10);
  Serial.println();
  Serial.print("Connecting to network: ");
  Serial.print(ssid);
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA); //init wifi mode
  Serial.setDebugOutput(true);
  WiFi.begin(ssid, WPA2_AUTH_PEAP, EAP_IDENTITY, EAP_USERNAME, EAP_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    counter++;
    if(counter>=60){ //after 30 seconds timeout - reset board
      ESP.restart();
    }
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address set: "); 
  Serial.println(WiFi.localIP()); //print LAN IP
}



// Insert Firebase project API Key
#define API_KEY ""

// // Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "" 

// //Define Firebase Data object

#define USER_EMAIL ""
#define USER_PASSWORD ""

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

String uid;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
int ldrData = 0;
float voltage = 0;
int ecg_data[10000];
int ecg_time[10000];
int ecg_data_real[10000];

void initializeFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase sign-up OK");
    signupOK = true;
  } else {
    Serial.printf("Firebase sign-up failed: %s\n", config.signer.signupError.message.c_str());
  }

  // Set the callback function to handle token status updates
  config.token_status_callback = tokenStatusCallback;

  // Begin the Firebase connection
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

int heartBeat[150] = {137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,151,151,150,149,147,145,143,141,139,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,134,131,128,125,121,149,173,217,261,238,215,192,169,146,123,100,118,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,139,141,143,145,147,149,151,153,155,157,158,159,160,160,159,158,156,154,152,150,148,146,143,140,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137};
int delayTime[] = {6200,5750,5250,4850,4475,4180,3875,3650};
int bmpLook[] = {60,65,70,75,80,85,90,95};
int bpmDelay = 0;
int arrayCounter = 0;
int arrayCounter2 = 0;
//Switch 1 Variables
int state_s1 = 0;
int state_prev_s1 = 0;
int pin_s1 = 14;
int val_s1 = 0;
unsigned long t_s1 = 0;
unsigned long t_0_s1 = 0;
unsigned long bounce_delay_s1 = 5;

//Switch 2 Variables
int state_s2 = 0;
int state_prev_s2 = 0;
int pin_s2 = 26;
int val_s2 = 0;
unsigned long t_s2 = 0;
unsigned long t_0_s2 = 0;
unsigned long bounce_delay_s2 = 5;

//Switch 3 variables
int state_s3 = 0;
int state_prev_s3 = 0;
int pin_s3 = 33;
int val_s3 = 0;
unsigned long t_s3 = 0;
unsigned long t_0_s3 = 0;
unsigned long bounce_delay_s3 = 5;

//Switch 4 variables
int state_s4 = 0;
int state_prev_s4 = 0;
int pin_s4 = 12;
int val_s4 = 0;
unsigned long t_s4 = 0;
unsigned long t_0_s4 = 0;
unsigned long bounce_delay_s4 = 5;

//LCD EStablish Connection Parameters: (rs, enable, d4, d5, d6, d7)
LiquidCrystal lcd(22, 23, 5, 18, 19, 21);

//Lead Off Detection
int pin_LO_pos = 34;
int pin_LO_neg = 35; 

//MENU display
int state_system = 0;
int state_prev_system = 0;
int state_system_value = -1;

int state_lowMenu = 0;
int state_prev_lowMenu = 0;

int state_highMenu = 0;
int state_prev_highMenu = 0;

int currentTime = 5;
int newTime = currentTime;

int currentBMP = 60;
int newBMP = currentBMP;

uint8_t check[8] = {0x0,0x1,0x3,0x16,0x1c,0x8,0x0};
uint8_t right[8] = {0x0,0x8,0xc,0xe,0xc,0x8,0x0};
uint8_t left[8]  = {0x0,0x2,0x6,0xe,0x6,0x2,0x0};
uint8_t up[8]    = {0x0,0x0,0x4,0xe,0x1f,0x0,0x0};
uint8_t down[8]  = {0x0,0x0,0x1f,0xe,0x4,0x0,0x0};
uint8_t wait1[8] = {0x1f,0x11,0xa,0x4,0xa,0x11,0x1f};
uint8_t wait2[8] = {0x1f,0x11,0xa,0x4,0xa,0x1f,0x1f};
uint8_t wait3[8] = {0x1f,0x11,0xa,0x4,0xe,0x1f,0x1f};

// TRIGGER SETTINGS
int state_trigger = 0;
int state_prev_trigger = 0;
int trigger_status = 0;  // 0 -> Artificial , 1 -> Human
int initalTime = 0;
int triggerTime = 0;
int triggerTime2 = 0;
int lowMenuHold = 0;
int count;

// SENSOR INPUT
int state_s2_hold = 0;
int state_s3_hold = 0;
int state_input_hold = 0;
int state_input = 0;
int state_prev_input = 0;

void setup() {
  // put your setup code here, to run once:
  delay(10000);
  Serial.begin(115200);
  pinMode(pin_s1, INPUT_PULLUP);
  pinMode(pin_s2, INPUT_PULLUP);
  pinMode(pin_s3, INPUT_PULLUP);
  pinMode(pin_s4, INPUT_PULLUP);
  pinMode(pin_LO_pos, INPUT);
  pinMode(pin_LO_neg, INPUT);
  gpio_pad_select_gpio(pin25);
  lcd.begin(16,2);
  Serial.println("Setup Complete");
  lcd.createChar (0,check);
  lcd.createChar (1,up);
  lcd.createChar (3,down);
  lcd.createChar (2,right);
  lcd.createChar (4,left);
  lcd.createChar (5,wait1);
  lcd.createChar (6,wait2);
  lcd.createChar (7,wait3);
  dac_output_enable(DAC_CHANNEL_1);
  arrayCounter = 0;

  connectToWifiSCHOOL();
  initializeFirebase();
  //wifiSetupfun();
}

void loop() {
  // put your main code here, to run repeatedly:
 // SM_s1();
 // SM_s2();
 // SM_s3();
  SM_s4();
 // if (state_s1 == 5){ Serial.println("Switch 1 Triggered"); }
 // if (state_s2 == 5){ Serial.println("Switch 2 Triggered"); }
 // if (state_s3 == 5){ Serial.println("Switch 3 Triggered"); }
 // if (state_s4 == 5){ Serial.println("Switch 4 Triggered"); }
  system();  
}

void SM_s1(){       // SWITCH 1
  state_prev_s1 = state_s1;

  switch (state_s1){
    case 0: //reset
    state_s1 = 1;
    break;

    case 1: //start
    val_s1 = digitalRead(pin_s1);
    if(val_s1 == LOW){
      state_s1 = 2;
    }
    break;

    case 2: //go
    t_0_s1 = millis();
    state_s1 = 3;
    break;

    case 3: //wait
    val_s1 = digitalRead(pin_s1);
    t_s1 = millis();
    if(val_s1 == HIGH){
      state_s1 = 0;
    }
    if ((t_s1-t_0_s1) > bounce_delay_s1) {
      state_s1 = 4;
    }
    break;

    case 4: //armed
    val_s1 = digitalRead(pin_s1);
    if(val_s1 == HIGH){
      state_s1 = 5;
    }
    break;

    case 5:
    state_s1 = 0;
    break;
  }}

void SM_s2(){       // SWITCH 2
  state_prev_s2 = state_s2;

  switch (state_s2){
    case 0: //reset
    state_s2 = 1;
    break;

    case 1: //start
    val_s2 = digitalRead(pin_s2);
    if(val_s2 == LOW){
      state_s2 = 2;
    }
    break;

    case 2: //go
    t_0_s2 = millis();
    state_s2 = 3;
    break;

    case 3: //wait
    val_s2 = digitalRead(pin_s2);
    t_s2 = millis();
    if(val_s2 == HIGH){
      state_s2 = 0;
    }
    if ((t_s2-t_0_s2) > bounce_delay_s2) {
      state_s2 = 4;
    }
    break;

    case 4: //armed
    val_s2 = digitalRead(pin_s2);
    if(val_s2 == HIGH){
      state_s2 = 5;
    }
    break;

    case 5:
    state_s2 = 0;
    break;
  }}

void SM_s3(){       // SWITCH 3
  state_prev_s3 = state_s3;

  switch (state_s3){
    case 0: //reset
    state_s3 = 1;
    break;

    case 1: //start
    val_s3 = digitalRead(pin_s3);
    if(val_s3 == LOW){
      state_s3 = 2;
    }
    break;

    case 2: //go
    t_0_s3 = millis();
    state_s3 = 3;
    break;

    case 3: //wait
    val_s3 = digitalRead(pin_s3);
    t_s3 = millis();
    if(val_s3 == HIGH){
      state_s3 = 0;
    }
    if ((t_s3-t_0_s3) > bounce_delay_s3) {
      state_s3 = 4;
    }
    break;

    case 4: //armed
    val_s3 = digitalRead(pin_s3);
    if(val_s3 == HIGH){
      state_s3 = 5;
    }
    break;

    case 5:
    state_s3 = 0;
    break;
  }}

void SM_s4(){       // SWITCH 4
  state_prev_s4 = state_s4;

  switch (state_s4){
    case 0: //reset
    state_s4 = 1;
    break;

    case 1: //start
    val_s4 = digitalRead(pin_s4);
    if(val_s4 == LOW){
      state_s4 = 2;
    }
    break;

    case 2: //go
    t_0_s4 = millis();
    state_s4 = 3;
    break;

    case 3: //wait
    val_s4 = digitalRead(pin_s4);
    t_s4 = millis();
    if(val_s4 == HIGH){
      state_s4 = 0;
    }
    if((t_s4-t_0_s4) > bounce_delay_s4) {
      state_s4 = 4;
    }
    break;

    case 4: //armed
    val_s4 = digitalRead(pin_s4);
    if(val_s4 == HIGH){
      state_s4 = 6;
    }
    break;

    case 5:
    state_s4 = 0;
    break;

    case 6: //armed
    val_s4 = digitalRead(pin_s4);
    if(val_s4 == HIGH){
      state_s4 = 7;
    }
    break;
    
    case 7: //enter Menu
    state_s4 = 0;
    arrayCounter=0;
    state_highMenu = 0;
    if(lowMenuHold == 0){
      state_system_value = state_system_value * -1;
    }
    break;
  }}
/********************************************************************************/
void heartBeat1(){  // HEART BEAT ARRAY

  int heartBeat1[150] = {137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,151,151,150,149,147,145,143,141,139,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,134,131,128,125,121,149,173,217,261,238,215,192,169,146,123,100,118,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,139,141,143,145,147,149,151,153,155,157,158,159,160,160,159,158,156,154,152,150,148,146,143,140,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137,137};
  for (int i = 0; i < 145 ; i++){
    int num = heartBeat1[i];
    dac_output_voltage(DAC_CHANNEL_1, num);  
    dac_output_enable(DAC_CHANNEL_1);
    Serial.println(num);
    delay(9);
  }}
/********************************************************************************/ 
void screen1(){     // SETTING
  lcd.setCursor(0, 0);
  lcd.print("    SETTING    ");
  lcd.setCursor(0, 1);
  lcd.print("  ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(2));
  lcd.setCursor(5, 1);
  lcd.print("        1/4");}
void screen2(){     // 1. SENSOR INPUT
  lcd.setCursor(0, 0);
  lcd.print("1. SENSOR INPUT ");
  lcd.setCursor(0, 1);
  lcd.print(char(4));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(2));
  lcd.setCursor(5, 1);
  lcd.print("        2/4");}
void screen3(){     // 2. SAMPLING TIME
  lcd.setCursor(0, 0);
  lcd.print("2. SAMPLING TIME");
  lcd.setCursor(0, 1);
  lcd.print(char(4));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(2));
  lcd.setCursor(5, 1);
  lcd.print("        3/4");}
void screen4(){     //    SAMPLING TIME -> CONFIGURATION
  lcd.setCursor(0, 0);
  lcd.print("  CURRENT TIME ");
  lcd.print(currentTime);
  lcd.setCursor(0, 1);
  lcd.print(char(1));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(3));
  lcd.setCursor(5, 1);
  lcd.print(" NEW TIME ");
  lcd.print(newTime);}

void screen5(){     // 3. EXIT
  lcd.setCursor(0, 0);
  lcd.print("3. EXIT         ");
  lcd.setCursor(0, 1);
  lcd.print(char(4));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.setCursor(3, 1);
  lcd.print("          4/4");}

void screen6(){     //    SENSOR INPUT 1. ARTIFICIAL HB
  lcd.setCursor(0, 0);
  lcd.print("1. ARTIFICIAL HB");
  lcd.setCursor(0, 1);
  lcd.print("  ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(2));
  lcd.setCursor(5, 1);
  lcd.print("        1/2");}
void screen7(){     //                    ARTIFICIAL HB -> BPM
  lcd.setCursor(0, 0);
  lcd.print("BEATS PER MINUTE");
  lcd.setCursor(0, 1);
  lcd.print("           [BPM]");}

void screen8(){     //                    ARTIFICIAL HB -> BPM -> CONFIGURATION
  lcd.setCursor(0, 0);
  lcd.print("  CURRENT BPM ");
  lcd.print(currentBMP);
  lcd.setCursor(0, 1);
  lcd.print(char(1));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.print(" ");
  lcd.print(char(3));
  lcd.print(" NEW BPM ");
  lcd.print(newBMP);}

void screen9(){     //    SENSOR INPUT 2. HUMAN HB
  lcd.setCursor(0, 0);
  lcd.print("2. HUMAN HB     ");
  lcd.setCursor(0, 1);
  lcd.print(char(4));
  lcd.print(" ");
  lcd.print(char(0));
  lcd.setCursor(3, 1);
  lcd.print("          2/2");}

void screen10(){    //    FIX [+] LEAD
  for(int i=0; i<1; i++){
    lcd.setCursor(0, 0);
    lcd.print("  FIX [+] LEAD  ");
    lcd.setCursor(0, 1);
    lcd.print("               ");
    lcd.print(char(5));
    delay(1000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("  FIX [+] LEAD  ");
    lcd.setCursor(0, 1);
    lcd.print("               ");
    lcd.print(char(6));
    delay(1000);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("  FIX [+] LEAD  ");
    lcd.setCursor(0, 1);
    lcd.print("               ");
    lcd.print(char(7));
    delay(1000);
    lcd.clear();
  } }
void screen11(){    //    FIX [-] LEAD
  lcd.clear();
  for(int i=0; i<1; i++){
    lcd.setCursor(0, 0);
    lcd.print("  FIX [-] LEAD  ");
    lcd.setCursor(0, 1);
    lcd.print("               ");
    lcd.print(char(5));
    delay(1000);
    lcd.clear();
    lcd.setCursor(2, 0);
    lcd.print("FIX [-] LEAD");
    lcd.setCursor(15, 1);
    lcd.print(char(6));
    delay(1000);
    lcd.clear();
    lcd.setCursor(2, 0);
    lcd.print("FIX [-] LEAD");
    lcd.setCursor(15, 1);
    lcd.print(char(7));
    delay(1000);
    lcd.clear();
  } }

void screen12(){    //    FIX BOTH LEADS
  lcd.clear();
  for(int i=0; i<1; i++){
    lcd.setCursor(1, 0);
    lcd.print("FIX BOTH LEADS");
    lcd.setCursor(15, 1);
    lcd.print(char(5));
    delay(1000);
    lcd.clear();
    lcd.setCursor(1, 0);
    lcd.print("FIX BOTH LEADS");
    lcd.setCursor(15, 1);
    lcd.print(char(6));
    delay(1000);
    lcd.clear();
    lcd.setCursor(1, 0);
    lcd.print("FIX BOTH LEADS");
    lcd.setCursor(15, 1);
    lcd.print(char(7));
    delay(1000);
    lcd.clear();
  } }

void screen13(){    //    READY TO START
  lcd.setCursor(0, 0);
  lcd.print("       READY TO ");
  lcd.setCursor(0, 1);
  lcd.print("  ");
  lcd.print(char(0));
  lcd.setCursor(3, 1);
  lcd.print("       START ");}
void screen14(float i){
  String s = String(int(i));
  lcd.setCursor(0, 0);
  lcd.print("   Transmitting "); 
  lcd.setCursor(0, 1);
  lcd.print("   Data ");
  lcd.setCursor(8, 1); 
  lcd.print(s); 
  lcd.print("%"); }
void screen15(){
  //String s = String(i);
  //lcd.setCursor(0, 0);
  lcd.print("   Transmitting "); 
  lcd.setCursor(0, 1);
  lcd.print("   Data         ");
  lcd.setCursor(8, 1); }//lcd.print(s);
    
/********************************************************************************/
void system(){
  state_prev_system = state_system;

  switch (state_system){

  case 0:
  if (state_system_value == -1){
    state_system = 1;
  }
  if (state_system_value == 1){
    state_system = 2;
  }
  break;

  case 1:
  lowMenu();
  state_system = 0;
  break;

  case 2:
  
  highMenu();
  state_system = 0;
  break;
  }}

/********************************************************************************/
void lowMenu(){
  state_prev_lowMenu = state_lowMenu;

  switch (state_lowMenu){
  
  case 0:
  state_lowMenu = 1;
  break;
  
  case 1:
  if (state_system_value == -1){
    state_lowMenu = 2;
  }
  break;
  
  case 2:
  if(digitalRead(pin_LO_neg)==1 && digitalRead(pin_LO_pos)==0){
        state_lowMenu = 3;
      }else if (digitalRead(pin_LO_neg)==0 && digitalRead(pin_LO_pos)==1) {
        state_lowMenu = 4;
      }else if (digitalRead(pin_LO_neg)==0 && digitalRead(pin_LO_pos)==0) {
        state_lowMenu = 6;
      }else if (digitalRead(pin_LO_neg)==1 && digitalRead(pin_LO_pos)==1) {
        state_lowMenu = 5;
      }
  break;

  case 3:
    screen10(); // FIX PPOSITIVE LEAD
    state_lowMenu = 0;
  break;

  case 4:
    screen11(); // FIX NEGATIVE LEAD
    state_lowMenu = 0;
  break;

  case 5:
    screen12(); // FIX BOTH LEADS
    state_lowMenu = 0;
  break;

  case 6:
    if(lowMenuHold == 0){
      screen13(); // READT TO START
      state_lowMenu = 0;
    } 
    SM_s2();
    if (state_s2 == 5 || lowMenuHold == 1){ 
      if(lowMenuHold == 0){
        lowMenuHold = 1;
        initalTime = millis();
        triggerTime2 = millis();
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(" SCAN IN PROCESS");
      }
      if(lowMenuHold == 1){
        trigger();
        
      }
    }
    
  break;
  }}

void trigger(){
  if(digitalRead(pin_LO_neg)==1 && digitalRead(pin_LO_pos)==0){
        state_lowMenu = 3;
        lowMenuHold = 0;
        state_lowMenu = 0;
        count = 0;
      }else if (digitalRead(pin_LO_neg)==0 && digitalRead(pin_LO_pos)==1) {
        state_lowMenu = 4;
        lowMenuHold = 0;
        state_lowMenu = 0;
        count = 0;
      }else if (digitalRead(pin_LO_neg)==1 && digitalRead(pin_LO_pos)==1) {
        state_lowMenu = 5;
        lowMenuHold = 0;
        state_lowMenu = 0;
        count = 0;
      }
  triggerTime = millis();

  int i;
  for(i = 0; i < sizeof(bmpLook); i++){
    if(bmpLook[i] == currentBMP){
      bpmDelay = i;
      break;
    }
  }
  if((triggerTime - initalTime) < (1000 * 30 * currentTime)){
    
    if(trigger_status == 0){
      if(count<140){
        int num = heartBeat[count];
        dac_output_voltage(DAC_CHANNEL_1, num);  
       // dac_output_enable(DAC_CHANNEL_1);
        Serial.print(num);
        Serial.print("\t");
        Serial.print(arrayCounter);
        int value = analogRead(pin36);
        ecg_data[arrayCounter] = value;
        ecg_time[arrayCounter] = millis();
        Serial.print("\t");
        delayMicroseconds(delayTime[bpmDelay]);
        Serial.print(ecg_data[arrayCounter]);
        Serial.print("\t");
        Serial.println(ecg_time[arrayCounter]);
        count++;
        arrayCounter++;
      }else if (count = 140) {
      int num = heartBeat[count];
        dac_output_voltage(DAC_CHANNEL_1, num);  
       //dac_output_enable(DAC_CHANNEL_1);
        Serial.print(num);
        Serial.print("\t");
        Serial.print(arrayCounter);
        int value = analogRead(pin36);
        ecg_data[arrayCounter] = value;
        ecg_time[arrayCounter] = millis();
        Serial.print("\t");
        delayMicroseconds(delayTime[bpmDelay]);
        Serial.print(ecg_data[arrayCounter]);
        Serial.print("\t");
        Serial.println(ecg_time[arrayCounter]);
        count = 1;
        arrayCounter++;
      }
    }
    if(trigger_status == 1){
      int currentTime2=millis();

      if ((currentTime2-triggerTime2)>=7){
        int value = analogRead(pin36);
        Serial.print(value);
        Serial.print("\t");
        Serial.println(arrayCounter2);
        ecg_data[arrayCounter2] = value;
        Serial.print("\t");
        ecg_time[arrayCounter2] = millis();
        arrayCounter2++;
        triggerTime2=millis();
      }
    }

    if((30*currentTime - (triggerTime - initalTime)/1000)>=100){
      lcd.setCursor(13, 1);
      lcd.print((30*currentTime - (triggerTime - initalTime)/1000));
    }
    if((30*currentTime - (triggerTime - initalTime)/1000)>=10 && (30*currentTime - (triggerTime - initalTime)/1000)<=99){
      lcd.setCursor(13, 1);
      lcd.print(" ");
      lcd.print((30*currentTime - (triggerTime - initalTime)/1000));
    }
    if((30*currentTime - (triggerTime - initalTime)/1000)<10){
      lcd.setCursor(13, 1);
      lcd.print("  ");
      lcd.print((30*currentTime - (triggerTime - initalTime)/1000));
    }
    }
    if((triggerTime - initalTime) >= ( 1000 * 30 * currentTime)){
      if(trigger_status == 0){
        clearData();
        updateData();
      }
      if(trigger_status == 1){
        clearData();
        updateData2();
      }
      lowMenuHold = 0;
      state_lowMenu = 0;
      count = 0;
    }
  
}
/********************************************************************************/

void highMenu(){
  state_prev_highMenu = state_highMenu;

  switch (state_highMenu){
  
  case 0:
  screen1();
  SM_s2();
  SM_s3();
  if(state_s2 == 5){
    state_highMenu = 0;
    state_system_value = -1;
  }
  if(state_s3 == 5){
    state_highMenu = 1;
  }
  break;

  case 1:
  if(state_s2_hold == 0){
    screen2();
  }
  SM_s1();
  SM_s2();
  SM_s3();
  if(state_s1 == 5 && state_s2_hold == 0){
    state_highMenu = 0;
  }
  if(state_s2 == 5 || state_s2_hold == 1){
    state_s2_hold = 1;
    sensor_input();
  }
  if(state_s3 == 5 && state_s2_hold == 0){
    state_highMenu = 2;
  }
  break;

  case 2:
  if(state_s3_hold == 0){
    screen3();
  }
  SM_s1();
  SM_s2();
  SM_s3();
  if(state_s1 == 5 && state_s3_hold == 0){          // WORKING HERE
    state_highMenu = 1;
  }
  if(state_s2 == 5 || state_s3_hold == 1){
    state_s3_hold = 1;
    sampling_time();
  }
  if(state_s3 == 5 && state_s3_hold == 0){
    state_highMenu = 3;
  }
  break;

  case 3:
  screen5();
  SM_s1();
  SM_s2();
  SM_s3();
  if(state_s1 == 5){
    state_highMenu = 2;
  }
  if(state_s2 == 5){
    state_highMenu = 0;
    state_system_value = -1;
  }
  break;
  }
}

void sensor_input(){
  state_prev_input = state_input;

  switch (state_input) {
  case 0:
  if(state_input_hold == 0){
    screen6();
  }
  SM_s2();
  SM_s3();
  if(state_s2 == 5 && state_input_hold == 0){
    state_input_hold = 1;
    screen7();
    delay(1500);
  }
  if(state_input_hold == 1){
    trigger_status = 0;
    screen8();
    SM_s1();
    SM_s2();
    SM_s3();
    if(state_s1 == 5){
      if(newBMP < 94){
      newBMP = newBMP + 5;
      }
    }
    if(state_s2 == 5){
      currentBMP = newBMP;
      newBMP = 60;
      state_highMenu = 0;
      state_system_value = -1;
      state_input_hold = 0;
      state_input = 0;
      state_s2_hold = 0;

    }
    if(state_s3 == 5){
      if(newBMP > 64){
      newBMP = newBMP - 5;
      }
    }
  }
  if(state_s3 == 5 && state_input_hold == 0){
    state_input = 1;
  }
  break;

  case 1:
  screen9();
  SM_s1();
  SM_s2();
  if(state_s1 == 5){
    state_input = 0;
  }
  if(state_s2 == 5){
    trigger_status = 1;
    state_input = 0;
    state_s2_hold = 0;
    state_highMenu = 0;
    state_system_value = -1;
  }
  break;
  }
}

void sampling_time(){
  screen4();
    SM_s1();
    SM_s2();
    SM_s3();
    if(state_s1 == 5){
      if(newTime < 9){
      newTime = newTime + 1;
      }
    }
    if(state_s2 == 5){
      currentTime = newTime;
      newTime = 1;
      state_highMenu = 0;
      state_system_value = -1;
      state_input_hold = 0;
      state_input = 0;
      state_s3_hold = 0;
    }
    if(state_s3 == 5){
      if(newTime > 1){
      newTime = newTime - 1;
      }
    }
}
void updateData(){
    int i = 0;
    int j=0;
    int k=0;
    float sum=0;
    int screenCount=0;
    int initalTime=millis();
    //String path_start = "ecg_data/00";
    //Firebase.RTDB.setInt(&fbdo,path_start,m);
    //m++;
    while(i <arrayCounter){
    if(screenCount==0){
      sum=(float(i)/arrayCounter)*100;
      screen14(sum);
      delay(5);
      screenCount++;
    }else{
      screen15();
      delay(5);
      screenCount--;
    }
    
    //if (Firebase.ready() && signupOK ){
      voltage =(float)ecg_data[i]/1000;
      String path_firebase = String((ecg_time[i]));
      //String path_firebase = String((i));
      String path = "ecg_data/"+ path_firebase;
      delay(10);

      if(Firebase.RTDB.setInt(&fbdo,path,voltage)){ 
      i++;
      fbdo.stopWiFiClient();
      }else{
        Firebase.refreshToken(&config);
        Serial.println("Refresh token");
        Serial.println("Failed: " + fbdo.errorReason());
        uid = auth.token.uid.c_str();
      }}
    
    }
    void updateData2(){
    int i = 0;
    int j=0;
    int k=0;
    float sum=0;
    int screenCount=0;
    int initalTime=millis();
    //String path_start = "ecg_data/00";
    //Firebase.RTDB.setInt(&fbdo,path_start,m);
    //m++;
    while(i <arrayCounter2){
    if(screenCount==0){
      sum=(float(i)/arrayCounter2)*100;
      screen14(sum);
      delay(5);
      screenCount++;
    }else{
      screen15();
      delay(5);
      screenCount--;
    }
    
    //if (Firebase.ready() && signupOK ){
      voltage =(float)ecg_data[i]/1000;
      String path_firebase = String((ecg_time[i]));
      //String path_firebase = String((i));
      String path = "ecg_data/"+ path_firebase;
      delay(10);

      if(Firebase.RTDB.setInt(&fbdo,path,voltage)){ 
      i++;
      fbdo.stopWiFiClient();
      }else{
        Firebase.refreshToken(&config);
        Serial.println("Refresh token");
        Serial.println("Failed: " + fbdo.errorReason());
        uid = auth.token.uid.c_str();
      }
    }
}

void clearData(){
    Firebase.RTDB.deleteNode(&fbdo, "ecg_data");
  }

void wifiSetupfun(){
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;
  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);

  Serial.println(ESP.getSdkVersion());
  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("Configuration status: ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}