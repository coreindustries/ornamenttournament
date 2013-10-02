/**
REQUIRES > 13v to run at full speed
**/

#define DIR_PIN 2
#define STEP_PIN 3

#define UPPER_LIMIT_PIN A5
#define LOWER_LIMIT_PIN A4


void setup() { 
  pinMode(DIR_PIN, OUTPUT); 
  pinMode(STEP_PIN, OUTPUT); 
  Serial.begin(9600);
  
  findLimits();
} 

void loop(){ 



  rotateDeg(2500, .2);  // down 
  delay(1000); 
  
  rotateDeg(-2500, .2);  //up
  delay(1000); 

}

void findLimits(){
  Serial.println("Finding Limits");
  
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

