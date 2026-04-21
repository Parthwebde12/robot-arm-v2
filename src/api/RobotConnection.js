// ==============================================================================
// 🤖 ROBOTIC ARM CONNECTION MANAGER (ESP32 COMPATIBLE)
// ==============================================================================

// 👉 STEP 1: Define your ESP32 IP
const ROBOT_IP_ADDRESS = "192.168.4.1"; 

// ESP32 default port → 80 (no need for 8080)
const ROBOT_API_URL = `http://192.168.4.1`;

// export object
export const RobotConnection = {
  
  // 👉 STEP 2: Send command to ESP32
  sendCommand: async (command, data) => {
    
    try {
      const response = await fetch(`${ROBOT_API_URL}/${command}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      return await response.json();

    } catch (error) {
      console.error("Connection Error:", error);
    }
  },

  // 👉 STEP 3: Move Joint
  moveJoint: async (joint, direction, speed = 1.0) => {
    
    return RobotConnection.sendCommand('move', { 
      joint: joint,          // base / shoulder / elbow
      direction: direction,  // left / right / up / down
      speed: speed 
    });
  },

  // 👉 STEP 4: Gripper Control
  setGripper: async (state) => {
    
    return RobotConnection.sendCommand('gripper', { 
      action: state          // open / close
    }); 
  },
  
  // 👉 STEP 5: Stop All Motors
  stopAll: async () => {
    
    return RobotConnection.sendCommand('stop', { 
      stop: true 
    });
  }
};