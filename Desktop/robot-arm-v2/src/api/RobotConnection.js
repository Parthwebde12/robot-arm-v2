// ==============================================================================
// 🤖 ROBOTIC ARM CONNECTION MANAGER
// ==============================================================================
// This file handles all communication between the mobile app and your robot arm.
// You need to update this file to match how your specific robot arm receives commands.
// ==============================================================================

// 👉 STEP 1: Define your Robot's IP Address or Connection URL here:
// (Change this to the IP address of your ESP32, Raspberry Pi, Arduino, etc.)
const ROBOT_IP_ADDRESS = "192.168.1.100"; 
const ROBOT_PORT = "8080";

// Example for HTTP REST API:
const ROBOT_API_URL = `http://${ROBOT_IP_ADDRESS}:${ROBOT_PORT}/api`;

// Example for WebSocket (Recommended for fast, real-time joystick control):
// const ROBOT_WS_URL = `ws://${ROBOT_IP_ADDRESS}:${ROBOT_PORT}`;
// let robotSocket = new WebSocket(ROBOT_WS_URL);

export const RobotConnection = {
  
  // 👉 STEP 2: Update the sendCommand function to actually transmit data
  sendCommand: async (command, data) => {
    
    // ---------------------------------------------------------
    // OPTION A: HTTP FETCH (Uncomment below to use HTTP requests)
    // ---------------------------------------------------------
    /*
    try {
      // 🔴 CHANGE THIS LINE to match your API endpoint route
      const response = await fetch(`${ROBOT_API_URL}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: command, payload: data })
      });
      return await response.json();
    } catch (error) {
      console.error("Connection Error:", error);
    }
    */

    // ---------------------------------------------------------
    // OPTION B: WEBSOCKETS (Uncomment below to use WebSockets)
    // ---------------------------------------------------------
    /*
    if (robotSocket && robotSocket.readyState === WebSocket.OPEN) {
      robotSocket.send(JSON.stringify({ action: command, payload: data }));
    }
    */

    // ---------------------------------------------------------
    // MOCK BEHAVIOR (Currently Active - Delete this when you add real code)
    // ---------------------------------------------------------
    console.log(`📡 [SENT TO ROBOT] COMMAND: ${command} | DATA:`, JSON.stringify(data));
    return new Promise((resolve) => setTimeout(resolve, 50)); 
  },

  // 👉 STEP 3: Customize the specific movement commands below
  // The 'joint' will be: 'base', 'shoulder', 'elbow'
  // The 'direction' will be: 'left', 'right', 'forward', 'backward', 'up', 'down'
  moveJoint: async (joint, direction, speed = 1.0) => {
    
    // 🔴 CHANGE THIS payload object to match what your robot code expects
    return RobotConnection.sendCommand('MOVE_JOINT', { 
      target_joint: joint, 
      move_direction: direction, 
      motor_speed: speed 
    });
  },

  // 👉 STEP 4: Customize the Gripper commands
  // 'state' will be either 'open' or 'close'
  setGripper: async (state) => {
    
    // 🔴 CHANGE THIS payload object to match your gripper logic
    return RobotConnection.sendCommand('SET_GRIPPER', { 
      gripper_action: state 
    }); 
  },
  
  // 👉 STEP 5: Customize the Stop command (Fired when you release a button)
  stopAll: async () => {
    
    // 🔴 CHANGE THIS to send your robot's specific "stop all motors" command
    return RobotConnection.sendCommand('EMERGENCY_STOP', { 
      halt_all_motors: true 
    });
  }
};
