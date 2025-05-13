
<?php
// Database configuration
$servername = "localhost";
$username = "root";  // Default XAMPP username
$password = "";      // Default XAMPP password
$dbname = "weather_history";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS " . $dbname;
if (!$conn->query($sql)) {
    die("Error creating database: " . $conn->error);
}

// Select the database
$conn->select_db($dbname);

// Create table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS daily_weather (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity INT(3) NOT NULL,
    wind_speed DECIMAL(5,2) NOT NULL,
    weather_code INT(3) NOT NULL,
    weather_description VARCHAR(255) NOT NULL,
    weather_icon VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY location_date (location, date)
)";

if (!$conn->query($sql)) {
    die("Error creating table: " . $conn->error);
}

// Process the incoming data
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
    exit();
}

// Get JSON data from request body
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (!$data) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Prepare statement
$stmt = $conn->prepare("INSERT INTO daily_weather 
                        (date, location, latitude, longitude, temperature, humidity, wind_speed, weather_code, weather_description, weather_icon) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                        ON DUPLICATE KEY UPDATE 
                        temperature = VALUES(temperature),
                        humidity = VALUES(humidity),
                        wind_speed = VALUES(wind_speed),
                        weather_code = VALUES(weather_code),
                        weather_description = VALUES(weather_description),
                        weather_icon = VALUES(weather_icon)");

if (!$stmt) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Prepare statement failed: ' . $conn->error]);
    exit();
}

// Bind parameters
$stmt->bind_param(
    "ssdddiisss",
    $date,
    $location,
    $latitude,
    $longitude,
    $temperature,
    $humidity,
    $wind_speed,
    $weather_code,
    $weather_description,
    $weather_icon
);

// Set values
$date = $data['date'];
$location = $data['location'];
$latitude = $data['latitude'];
$longitude = $data['longitude'];
$temperature = $data['temperature'];
$humidity = $data['humidity'];
$wind_speed = $data['windSpeed'];
$weather_code = $data['weatherCode'];
$weather_description = $data['description'];
$weather_icon = $data['icon'];

// Execute statement
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Weather data saved successfully']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Failed to save weather data: ' . $stmt->error]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>
