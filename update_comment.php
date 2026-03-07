<?php
date_default_timezone_set('Asia/Jakarta');

$host = 'localhost';
$db   = 'iwhlvgxm_undanganapi';
$user = 'iwhlvgxm_undanganapi';
$pass = '2L4bK*Y.!AW~_+Rv';
$charset = 'latin1';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC];

try { $pdo = new PDO($dsn,$user,$pass,$options); } catch (\PDOException $e){ die(json_encode(['status'=>false])); }

$uuid = $_POST['uuid'] ?? '';
$comment = $_POST['comment'] ?? null;
$presence = $_POST['presence'] ?? null;

if(!$uuid){ echo json_encode(['status'=>false,'message'=>'UUID missing']); exit; }

$fields=[]; $params=[];
if($comment!==null){ $fields[]="comment=?"; $params[]=$comment; }
if($presence!==null){ $fields[]="presence=?"; $params[]=$presence; }
if(empty($fields)){ echo json_encode(['status'=>false,'message'=>'Nothing to update']); exit; }
$fields[]="updated_at=?"; $params[]=date('Y-m-d H:i:s'); $params[]=$uuid;

$stmt = $pdo->prepare("UPDATE comments SET ".implode(',',$fields)." WHERE uuid=?");
$success = $stmt->execute($params);
echo json_encode(['status'=>$success]);
?>