<script>
	// @ts-nocheck
	import { Button } from '$lib/components/ui/button';
	import image2 from '../pics/about/2.webp?w=500;700;900;1200&as=srcset';
	import lqip from '../pics/about/2.webp?lqip';
</script>

<section class="relative bg-[#f7f3f7] px-8 py-16">
	<div class="mx-auto flex max-w-7xl flex-wrap">
		<div class=" flex max-w-[500px] justify-center">
			<picture>
				<source srcset={image2} type="image/webp" />
				<img
					alt="Speaker"
					class="relative z-10 rounded-lg"
					src={lqip.src}
					width={lqip.width}
					height={lqip.height}
					style="background-image: url('{lqip.lqip}'); background-size: cover; aspect-ratio: 400/400; object-fit: cover;"
				/>
			</picture>
		</div>
		<div class="relative flex-1 px-8">
			<h4 class="mb-2 text-sm uppercase tracking-widest text-[#6e5494]">About</h4>
			<h2 class="mb-4 text-4xl font-bold">H.G. Savyasachi Das</h2>
			<div class="mb-8 border-l-4 border-[#6e5494] pl-4 text-gray-600">
				<p>
					Hare Krishna Hare Krishna, Krishna Krishna Hare Hare Hare Rama Hare Rama, Rama Rama Hare
					Hare Hare Krishna Hare Krishna, Krishna Krishna Hare Hare Hare Rama Hare Rama, Rama Rama
					Hare Hare
				</p>
			</div>
			<Button class="text-md rounded-none bg-[#6e5494] text-white">Read More</Button>
		</div>
	</div>
</section>
