// Vercel 서버리스 함수 - 스타일 변환 시작
module.exports = async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { apiToken, image, style } = req.body;
        
        if (!apiToken || !image || !style) {
            return res.status(400).json({ 
                error: '필수 파라미터가 누락되었습니다.' 
            });
        }
        
        // 스타일 프롬프트 매핑
        const stylePrompts = {
            'van_gogh': 'in the style of Vincent van Gogh, swirling brushstrokes, vibrant colors, starry night style',
            'picasso': 'in the style of Pablo Picasso, cubist, geometric shapes, abstract faces',
            'monet': 'in the style of Claude Monet, impressionist, soft brush strokes, water lilies',
            'munch': 'in the style of Edvard Munch, expressionist, emotional, the scream style',
            'klimt': 'in the style of Gustav Klimt, golden decorative patterns, art nouveau',
            'kandinsky': 'in the style of Wassily Kandinsky, abstract geometric shapes, colorful composition',
            'ukiyo-e': 'in the style of Japanese Ukiyo-e, woodblock print, the great wave',
            'watercolor': 'watercolor painting style, soft colors, flowing brushstrokes',
            'oil_painting': 'classical oil painting style, rich colors, textured brushwork'
        };
        
        const prompt = stylePrompts[style] || stylePrompts['van_gogh'];
        
        // Replicate API 호출
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'a478e6eeb1aed1f3a8f4e1411cba09d4cf604d2f657b99ecc1e90d75ce1ae121',
                input: {
                    image: image,
                    prompt: prompt,
                    style_strength: 1.0
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.detail || 'API 요청 실패' 
            });
        }
        
        const prediction = await response.json();
        
        return res.status(200).json({
            predictionId: prediction.id,
            status: prediction.status
        });
        
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: '서버 오류: ' + error.message 
        });
    }
}
