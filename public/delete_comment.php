<?php
session_start();

header('Content-Type: application/json');

$host = 'localhost';
$db   = 'iwhlvgxm_undanganapi';
$user = 'iwhlvgxm_undanganapi';
$pass = '2L4bK*Y.!AW~_+Rv';
$charset = 'latin1';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn,$user,$pass,$options);
} catch (\PDOException $e){
    echo json_encode(['status'=>false]);
    exit;
}

# CEK LOGIN
if(!isset($_SESSION['user'])){
    echo json_encode([
        'status'=>false,
        'message'=>'login_required'
    ]);
    exit;
}

$uuid = $_POST['uuid'] ?? '';

if(!$uuid){
    echo json_encode([
        'status'=>false,
        'message'=>'UUID missing'
    ]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM comments WHERE uuid=?");
$success = $stmt->execute([$uuid]);

echo json_encode([
    'status'=>$success
]);
?>
