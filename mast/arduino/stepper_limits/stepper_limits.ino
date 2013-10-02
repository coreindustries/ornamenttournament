/**
REQUIRES > 13v to run at full speed

Easy Driver
http://www.schmalzhaus.com/EasyDriver/index.html

Each EasyDriver can drive up to about 750mA per phase of a bi-polar stepper motor. 
It defaults to 8 step microstepping mode. (So if your motor is 200 full steps per 
revolution, you would get 1600 steps/rev using EasyDriver.) This setting can be 
easily overridden by tying the MS1 or MS2 pin to ground. It is a chopper microstepping 
driver based on the Allegro A3967 driver chip. For the complete specs of the design, 
read the A3967 datasheet. It has a variable max current from about 150mA/phase to 750mA/phase. 
It can take a maximum motor drive voltage of around 30V, and includes on-board 5V regulation, 
so only one supply is necessary.
**/

#define DIR_PIN 2
#define STEP_PIN 3

#define UPPER_LIMIT_PIN A5
#define LOWER_LIMIT_PIN A4

int move_distance = 0;      // distance (in degrees) to move on each loop. negative values UP, positive DOWN
int speed = .2;             // try more votage to see if we can go faster
bool limits_found = false;  // set true after we find our limits


void setup() { 
  pinMode(DIR_PIN, OUTPUT);
  pinMode(STEP_PIN, OUTPUT);
  // pinMode(UPPER_LIMIT_PIN, INPUT);
  Serial.begin(9600);
  
  findLimits();
} 



void loop(){ 
  // rotateDeg(2500, .2);  // down 
  // delay(1000); 
  
  // rotateDeg(-2500, .2);  //up
  // delay(1000); 

  checkLimits();
  move(move_distance);
  delay(10);

}

/* always check the limit switches before moving
limit switches are wired to A5 and A4 for one leg
wireds via pigtail to 5v. When switch is on, a value of 1023 is read
To avoid fluctuations, add a 1K resistor between A5 and GND, and A4 and GND
*/
void checkLimits(){
  int upper_switch = analogRead(UPPER_LIMIT_PIN);
  int lower_switch = analogRead(LOWER_LIMIT_PIN);
  // Serial.print("Upper: ");
  
  // Serial.print("Lower: ");
  // Serial.println(lower_switch);

  if(upper_switch == 1023 ){
    Serial.print("UPPER LIMIT REACHED: ");
    Serial.println(upper_switch);
    
    // move_distance = 0;
    // Serial.println("FULL STOP");
  }
    if(lower_switch == 1023 ){
    Serial.print("LOWER LIMIT REACHED: ");
    Serial.println(lower_switch);
    
    // move_distance = 0;
    // Serial.println("FULL STOP");
  }
}



void findLimits(){
  Serial.println("Starting findLimits function");
  // move_distance = -10;
  
}


// move the specified degrees in a direction
// sanity check first
void move(int distance){
  if(distance > 0){
    rotateDeg(distance, speed);
  }
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

