// Vercel 서버리스 함수 - 변환 상태 확인
module.exports = async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { predictionId, apiToken } = req.query;
        
        if (!predictionId || !apiToken) {
            return res.status(400).json({ 
                error: '필수 파라미터가 누락되었습니다.' 
            });
        }
        
        // Replicate API로 상태 확인
        const response = await fetch(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            {
                headers: {
                    'Authorization': `Token ${apiToken}`
                }
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.detail || '상태 확인 실패' 
            });
        }
        
        const prediction = await response.json();
        
        return res.status(200).json({
            status: prediction.status,
            output: prediction.output,
            error: prediction.error
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: '서버 오류: ' + error.message 
        });
    }
}
