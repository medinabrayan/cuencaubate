<?php
header('Content-Type: application/json');
require_once 'db.php';

// Verificar método HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Método no permitido']));
}

// Obtener datos
$data = json_decode(file_get_contents('php://input'), true);

// Validación básica
$requiredFields = ['session_id', 'nombre_cientifico', 'imagen'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => "Campo requerido: $field"]));
    }
}

try {
    // 1. Verificar si ya existe (para evitar duplicados)
    $checkQuery = "SELECT id FROM plantas WHERE session_id = ?";
    $stmt = $conexion->prepare($checkQuery);
    $stmt->bind_param("s", $data['session_id']);
    $stmt->execute();
    
    if ($stmt->get_result()->num_rows > 0) {
        die(json_encode(['success' => false, 'message' => 'Esta planta ya fue guardada']));
    }

    // 2. Procesar imagen
    $imageDir = __DIR__ . '/../assets/img/plantas/';
    if (!is_dir($imageDir)) {
        mkdir($imageDir, 0755, true);
    }

    $imageName = 'planta_' . $data['session_id'] . '.png';
    $imagePath = 'assets/img/plantas/' . $imageName;
    $imageData = base64_decode($data['imagen']);

    if (!file_put_contents($imageDir . $imageName, $imageData)) {
        throw new Exception('Error al guardar la imagen');
    }

    // 3. Insertar en BD
    $insertQuery = "INSERT INTO plantas (
        session_id,
        nombre_cientifico,
        nombre_comun,
        imagen_path,
        probabilidad,
        estado,
        fecha_creacion
    ) VALUES (?, ?, ?, ?, ?, ?, NOW())";

    $stmt = $conexion->prepare($insertQuery);
    $stmt->bind_param(
        "ssssds",
        $data['session_id'],
        $data['nombre_cientifico'],
        $data['nombre_comun'],
        $imagePath,
        $data['probabilidad'],
        $data['estado'] ?? 'pending'
    );

    if (!$stmt->execute()) {
        // Si falla, borramos la imagen guardada
        if (file_exists($imageDir . $imageName)) {
            unlink($imageDir . $imageName);
        }
        throw new Exception('Error en la base de datos: ' . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Planta guardada',
        'plant_id' => $stmt->insert_id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}
?>