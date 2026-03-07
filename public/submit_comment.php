<?php
session_start();
date_default_timezone_set('Asia/Jakarta');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = 'localhost';
$db   = 'iwhlvgxm_undanganapi';
$user = 'iwhlvgxm_undanganapi';
$pass = '2L4bK*Y.!AW~_+Rv';

try{
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
}catch(PDOException $e){
    echo json_encode(['status'=>false,'message'=>'DB connection failed']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$presence = $_POST['presence'] ?? '0';
$comment = trim($_POST['comment'] ?? '');
$parent_id = $_POST['parent_id'] ?? null;

/*
Jika ini REPLY → wajib login
*/
if($parent_id){

    if(!isset($_SESSION['user'])){
        echo json_encode([
            'status'=>false,
            'message'=>'login_required'
        ]);
        exit;
    }

    // gunakan nama dari user login
    $name = $_SESSION['user']['name'];
}

/*
Komentar utama tetap boleh guest
*/
if($name === '' || $comment === ''){
    echo json_encode(['status'=>false,'message'=>'Invalid input']);
    exit;
}

$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$comment = htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');

$uuid = bin2hex(random_bytes(16));
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$own = bin2hex(random_bytes(8));
$is_admin = 0;

$now = date('Y-m-d H:i:s');

$stmt = $pdo->prepare("
INSERT INTO comments 
(user_id,name,presence,comment,created_at,updated_at,uuid,ip,user_agent,parent_id,own,is_admin)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
");

$success = $stmt->execute([
    null,
    $name,
    $presence,
    $comment,
    $now,
    $now,
    $uuid,
    $ip,
    $user_agent,
    $parent_id,
    $own,
    $is_admin
]);

if($success){

echo json_encode([
'status'=>true,
'message'=>'Comment added',
'data'=>[
    'uuid'=>$uuid,
    'name'=>$name,
    'presence'=>$presence,
    'comment'=>$comment,
    'parent_id'=>$parent_id,
    'created_at'=>$now,
    'updated_at'=>$now,
    'own'=>$own,
    'like_count'=>0,
    'comments'=>[],
    'is_parent'=> $parent_id === null,
    'ip'=>$ip,
    'user_agent'=>$user_agent,
]
]);

}else{

echo json_encode([
'status'=>false,
'message'=>'Failed to insert comment'
]);

}