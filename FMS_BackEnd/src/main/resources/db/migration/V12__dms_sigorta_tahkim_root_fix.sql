-- V12: Sigorta Tahkim kök adı + yetim kök klasörleri Genel Dosyalar altına taşı

UPDATE folders SET name = 'Sigorta Tahkim' WHERE id = '88888888-8888-8888-8888-888888888802';

UPDATE folders SET name = 'Ön Başvuru' WHERE id = '88888888-8888-8888-8888-888888888821';

UPDATE folders
SET parent_id = '88888888-8888-8888-8888-888888888801'
WHERE parent_id IS NULL
  AND id NOT IN (
      '88888888-8888-8888-8888-888888888801',
      '88888888-8888-8888-8888-888888888802'
  )
  AND deleted = FALSE;
