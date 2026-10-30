<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
function out(int $code, array $payload): never { http_response_code($code); echo json_encode($payload, JSON_UNESCAPED_UNICODE); exit; }
$configFile=__DIR__.'/config.php';
if (!is_file($configFile)) out(503, ['error'=>'Ranking não configurado']);
$c=require $configFile;
try { $db=new PDO($c['dsn'], $c['user'], $c['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]); }
catch(Throwable $e){out(503,['error'=>'Ranking indisponível']);}
if ($_SERVER['REQUEST_METHOD']==='GET' && ($_GET['action']??'')==='list') {
 $rows=$db->query('SELECT player AS name, MAX(score) AS score FROM sw_scores WHERE created_at > DATE_SUB(NOW(), INTERVAL 90 DAY) GROUP BY player ORDER BY score DESC LIMIT 20')->fetchAll(PDO::FETCH_ASSOC);
 out(200,['items'=>$rows]);
}
if ($_SERVER['REQUEST_METHOD']!=='POST') out(405,['error'=>'Método inválido']);
if ((int)($_SERVER['CONTENT_LENGTH']??0)>1024) out(413,['error'=>'Dados extensos']);
$data=json_decode(file_get_contents('php://input') ?: '',true);
if (!is_array($data)||($data['action']??'')!=='score')out(400,['error'=>'Requisição inválida']);
$name=trim((string)($data['name']??''));$score=filter_var($data['score']??null,FILTER_VALIDATE_INT);
if (!preg_match('/^[\\p{L}\\p{N} _-]{2,18}$/u',$name)||$score===false||$score<1||$score>100000)out(422,['error'=>'Nome ou pontuação inválidos']);
$ipHash=hash('sha256',($_SERVER['REMOTE_ADDR']??'').($c['salt']??''));
$throttle=$db->prepare('SELECT COUNT(*) FROM sw_scores WHERE ip_hash=? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)');$throttle->execute([$ipHash]);
if ((int)$throttle->fetchColumn()>=5)out(429,['error'=>'Muitas tentativas']);
$stmt=$db->prepare('INSERT INTO sw_scores(player,score,ip_hash) VALUES(?,?,?)');$stmt->execute([$name,$score,$ipHash]);
out(200,['ok'=>true]);
