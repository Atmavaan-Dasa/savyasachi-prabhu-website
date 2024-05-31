<script lang="ts">
	// @ts-nocheck
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	import image1 from '../pics/landing/1.webp?w=500;700;900;1200&as=srcset';
	import image2 from '../pics/landing/2.jpg?w=500;700;900;1200&as=srcset';
	import lqip from '../pics/landing/1.webp?lqip';
	import lqip2 from '../pics/landing/2.jpg?lqip';
</script>

<div class="mx-auto my-10 max-w-7xl">
	<div class=" relative rounded-lg bg-pink-100 p-6 md:p-14">
		<Carousel.Root class="relative mx-auto rounded-xl ">
			<Carousel.Content>
				<Carousel.Item>
					<picture>
						<source srcset={image1} type="image/webp" />
						<img
							src={lqip.src}
							width={lqip.width}
							height={lqip.height}
							style="background-image: url('{lqip.lqip}'); background-size: cover;"
							class="rounded-md"
							alt=""
						/>
					</picture>
				</Carousel.Item>
				<Carousel.Item>
					<picture>
						<source srcset={image1} type="image/jpg" />
						<img
							src={lqip2.src}
							width={lqip2.width}
							height={lqip2.height}
							style="background-image: url('{lqip2.lqip}'); background-size: cover;"
							alt=""
						/>
					</picture>
				</Carousel.Item>
			</Carousel.Content>
			<Carousel.Previous class="hiddel md:flex" />
			<Carousel.Next class="hidden md:flex" />
			<div class="md:hidden">
				<Carousel.Previous />
				<Carousel.Next />
			</div>
		</Carousel.Root>
	</div>
</div>
