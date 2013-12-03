/**
REQUIRES > 13v to run at full speed
**/

#define DIR_PIN 2
#define STEP_PIN 3

void setup() { 
  pinMode(DIR_PIN, OUTPUT); 
  pinMode(STEP_PIN, OUTPUT); 
} 

void loop(){ 

  //rotate a specific number of degrees 
//  rotateDeg(360, .5); 
//  delay(1000);

  rotateDeg(1000, .3);  // down 
  delay(1000); 
  
  rotateDeg(-1000, .3);  //up
  delay(1000); 

//  rotations(3);
//  delay(2000);

  //rotate a specific number of microsteps (8 microsteps per step)
  //a 200 step stepper would take 1600 micro steps for one full revolution
//  rotate(1600, .9); 
//  delay(1000); 
//
//  rotate(-1600, .9); //reverse
//  delay(1000); 
}


void rotations(int rot){
 int d = rot * 360;
 rotateDeg(d, .7); 
}



void rotate(int steps, float speed){ 
  //rotate a specific number of microsteps (8 microsteps per step) - (negitive for reverse movement)
  //speed is any number from .01 -> 1 with 1 being fastest - Slower is stronger
  int dir = (steps > 0)? HIGH:LOW;
  steps = abs(steps);

  digitalWrite(DIR_PIN,dir); 

  float usDelay = (1/speed) * 70;

  for(int i=0; i < steps; i++){ 
    digitalWrite(STEP_PIN, HIGH); 
    delayMicroseconds(usDelay); 

    digitalWrite(STEP_PIN, LOW); 
    delayMicroseconds(usDelay); 
  } 
} 

void rotateDeg(float deg, float speed){ 
  //rotate a specific number of degrees (negitive for reverse movement)
  //speed is any number from .01 -> 1 with 1 being fastest - Slower is stronger
  int dir = (deg > 0)? HIGH:LOW;
  digitalWrite(DIR_PIN,dir); 

  int steps = abs(deg)*(1/0.225);
  float usDelay = (1/speed) * 70;

  for(int i=0; i < steps; i++){ 
    digitalWrite(STEP_PIN, HIGH); 
    delayMicroseconds(usDelay); 

    digitalWrite(STEP_PIN, LOW); 
    delayMicroseconds(usDelay); 
  } 
}

