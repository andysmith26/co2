<!-- src/lib/components/Students/StudentStatsCard.svelte -->
<script lang="ts">
	interface StatsCardProps {
		title: string;
		value: number | string;
		subtitle?: string;
		color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink' | 'gray';
		icon?: string;
		clickable?: boolean;
	}

	const { 
		title, 
		value, 
		subtitle = '', 
		color = 'blue', 
		icon = '', 
		clickable = false 
	} = $props<StatsCardProps>();

	// Color mappings for consistent design
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600',
		green: 'bg-green-50 text-green-600',
		purple: 'bg-purple-50 text-purple-600',
		orange: 'bg-orange-50 text-orange-600',
		indigo: 'bg-indigo-50 text-indigo-600',
		pink: 'bg-pink-50 text-pink-600',
		gray: 'bg-gray-50 text-gray-600'
	};

	const baseClasses = 'p-4 rounded-lg text-center transition-all duration-200';
	const interactiveClasses = clickable 
		? 'hover:shadow-md hover:scale-105 cursor-pointer transform' 
		: '';
</script>

<div 
	class="{baseClasses} {colorClasses[color]} {interactiveClasses}"
	role={clickable ? 'button' : undefined}
	tabindex={clickable ? 0 : undefined}
>
	{#if icon}
		<div class="text-lg mb-1">{icon}</div>
	{/if}
	
	<div class="text-2xl font-bold">
		{typeof value === 'number' && value > 999 
			? `${Math.floor(value / 1000)}k+` 
			: value}
	</div>
	
	<div class="text-sm text-gray-600 font-medium">{title}</div>
	
	{#if subtitle}
		<div class="text-xs text-gray-500 mt-1">{subtitle}</div>
	{/if}
</div>
