<?php
session_start();
date_default_timezone_set('Asia/Jakarta');


$pdo = new PDO(
"mysql:host=localhost;dbname=iwhlvgxm_undanganapi;charset=utf8mb4",
"iwhlvgxm_undanganapi",
"2L4bK*Y.!AW~_+Rv"
);

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if($user && password_verify($password,$user['password'])){

$_SESSION['user']=[
'id'=>$user['id'],
'name'=>$user['name'],
'email'=>$user['email']
];

echo json_encode([
'status'=>true,
'name'=>$user['name']
]);

}else{

echo json_encode([
'status'=>false,
'message'=>'Email atau password salah'
]);

}